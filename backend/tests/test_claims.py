# Project Modules
from tests.test_items import ITEM

PROOF = {"message": "It has my student card with the name Ann Lee inside."}


async def test_claim_lifecycle(make_client):
    finder = await make_client("finder@example.com")
    ann = await make_client("ann@example.com")
    bob = await make_client("bob@example.com")

    item = (await finder.post("/items", json=ITEM)).json()
    url = f"/items/{item['id']}/claims"

    assert (await finder.post(url, json=PROOF)).status_code == 409

    ann_claim = await ann.post(url, json=PROOF)
    assert ann_claim.status_code == 201, ann_claim.text
    ann_claim = ann_claim.json()
    assert ann_claim["status"] == "pending"
    assert (await ann.post(url, json=PROOF)).status_code == 409

    bob_claim = (await bob.post(url, json=PROOF)).json()

    assert (await ann.get(url)).status_code == 403
    claims = (await finder.get(url)).json()
    assert {c["claimant_email"] for c in claims} == {
        "ann@example.com",
        "bob@example.com",
    }

    mine = (await ann.get("/claims/mine")).json()
    assert mine[0]["finder_email"] is None
    assert mine[0]["item"]["id"] == item["id"]

    assert (await ann.post(f"/claims/{ann_claim['id']}/approve")).status_code == 403

    approved = await finder.post(f"/claims/{ann_claim['id']}/approve")
    assert approved.status_code == 200, approved.text
    assert approved.json()["status"] == "approved"

    assert (await finder.get(f"/items/{item['id']}")).json()["status"] == "returned"

    statuses = {c["id"]: c["status"] for c in (await finder.get(url)).json()}
    assert statuses == {ann_claim["id"]: "approved", bob_claim["id"]: "rejected"}

    mine = (await ann.get("/claims/mine")).json()
    assert mine[0]["finder_email"] == "finder@example.com"
    assert (await bob.get("/claims/mine")).json()[0]["finder_email"] is None

    assert (await finder.post(f"/claims/{bob_claim['id']}/approve")).status_code == 409
    carl = await make_client("carl@example.com")
    assert (await carl.post(url, json=PROOF)).status_code == 409


async def test_reject_and_withdraw(make_client):
    finder = await make_client("finder@example.com")
    ann = await make_client("ann@example.com")

    item = (await finder.post("/items", json=ITEM)).json()
    url = f"/items/{item['id']}/claims"

    claim = (await ann.post(url, json=PROOF)).json()
    rejected = await finder.post(f"/claims/{claim['id']}/reject")
    assert rejected.json()["status"] == "rejected"
    assert (await ann.delete(f"/claims/{claim['id']}")).status_code == 409

    retry = (await ann.post(url, json=PROOF)).json()
    assert (await finder.delete(f"/claims/{retry['id']}")).status_code == 403
    assert (await ann.delete(f"/claims/{retry['id']}")).status_code == 204
    assert (await ann.get("/claims/mine")).json()[0]["status"] == "rejected"


async def test_claim_validation(make_client):
    finder = await make_client("finder@example.com")
    ann = await make_client("ann@example.com")
    item = (await finder.post("/items", json=ITEM)).json()
    short = await ann.post(f"/items/{item['id']}/claims", json={"message": "mine"})
    assert short.status_code == 422
    assert (await ann.post("/items/999/claims", json=PROOF)).status_code == 404
