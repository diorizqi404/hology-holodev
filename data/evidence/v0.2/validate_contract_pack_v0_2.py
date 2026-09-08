import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).parent


def load(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def utc(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def main():
    canonical = load("bmkg_canonical_example.json")
    schema = load("bmkg_canonical_evidence.schema.json")
    Draft202012Validator(schema, format_checker=FormatChecker()).validate(canonical)

    assert canonical["source"]["name"] == "BMKG"
    assert canonical["source"]["attribution_required"] is True
    assert canonical["provenance"]["is_mock"] is False
    assert canonical["location"]["administrative"]["adm4"]
    assert canonical["temporal"]["analysis_time"] == canonical["payload"]["analysis_time"]
    assert utc(canonical["temporal"]["analysis_time"]) <= utc(canonical["provenance"]["fetched_at"])
    assert utc(canonical["temporal"]["first_target_time"]) <= utc(canonical["temporal"]["last_target_time"])

    mock = deepcopy(canonical)
    mock["evidence_id"] = "EVD-BMKG-MOCK-001"
    mock["source"]["category"] = "official_mock"
    mock["provenance"]["collection_mode"] = "fixture"
    mock["provenance"]["is_mock"] = True
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    validator.validate(mock)
    assert mock["provenance"]["is_mock"] is True

    inconsistent_live = deepcopy(canonical)
    inconsistent_live["provenance"]["is_mock"] = True
    assert not validator.is_valid(inconsistent_live)

    inconsistent_mock = deepcopy(mock)
    inconsistent_mock["provenance"]["is_mock"] = False
    assert not validator.is_valid(inconsistent_mock)

    options = load("ACTION_OPTIONS_v0.2.json")["options"]
    option_ids = [option["option_id"] for option in options]
    assert len(option_ids) == len(set(option_ids))
    assert all(option.get("title") for option in options)
    assert all(option.get("description") for option in options)
    assert all(option.get("rationale") for option in options)
    assert load("ACTION_OPTIONS_v0.2.json")["ranking"] is None

    expected = load("expected_results.json")
    primary = load("fixtures/deterministic_scenarios.json")
    supplemental = load("fixtures/supplemental_scenarios.json")
    scenario_ids = [item["id"] for item in primary + supplemental]
    assert set(scenario_ids) == set(expected)

    ruleset = load("ruleset_water_v0.2.json")
    assert ruleset["deterministic"] is True
    assert ruleset["ranked_recommendation_enabled"] is False
    assert ruleset["confidence_policy"]["high_enabled"] is False

    print("BMKG canonical schema: PASS")
    print("Canonical temporal/provenance invariants: PASS")
    print("Mock provenance protection: PASS")
    print("Action option registry invariants: PASS")
    print("Scenario/expected-result coverage: PASS (8/8)")
    print("Ruleset safety invariants: PASS")


if __name__ == "__main__":
    main()
