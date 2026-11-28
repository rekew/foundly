# Python Modules
from datetime import date, timedelta

ITEM = {
    "title": "Black leather wallet",
    "description": "Found near the main library entrance, has a bus card inside.",
    "category": "wallets",
    "location": "Main library",
    "found_on": date.today().isoformat(),
}


async def test_create_requires_auth(make_client):
    anon = await make_client()
    assert (await anon.post("/items", json=ITEM)).status_code == 401


async def test_item_crud_and_search(make_client):
    finder = await make_client("finder@example.com")
    other = await make_client("other@example.com")
    anon = await make_client()

    res = await finder.post("/items", json=ITEM)
    assert res.status_code == 201, res.text
    item = res.json()
    assert item["status"] == "open"

    await finder.post(
        "/items",
        json={
            **ITEM,
            "title": "Blue umbrella",
            "description": "Folding umbrella left on a bench.",
            "category": "other",
            "location": "Gym",
        },
    )

    page = (await anon.get("/items")).json()
    assert page["total"] == 2

    found = (await anon.get("/items", params={"q": "LIBRARY"})).json()
    assert [i["id"] for i in found["items"]] == [item["id"]]

    by_cat = (await anon.get("/items", params={"category": "other"})).json()
    assert by_cat["total"] == 1

    assert (await anon.get(f"/items/{item['id']}")).status_code == 200
    assert (await anon.get("/items/9999")).status_code == 404

    forbidden = await other.patch(f"/items/{item['id']}", json={"title": "Mine now"})
    assert forbidden.status_code == 403

    patched = await finder.patch(f"/items/{item['id']}", json={"title": "Brown wallet"})
    assert patched.json()["title"] == "Brown wallet"

    mine = (await finder.get("/items/mine")).json()
    assert mine["total"] == 2
    assert (await other.get("/items/mine")).json()["total"] == 0

    assert (await other.delete(f"/items/{item['id']}")).status_code == 403
    assert (await finder.delete(f"/items/{item['id']}")).status_code == 204
    assert (await anon.get(f"/items/{item['id']}")).status_code == 404


async def test_item_validation(make_client):
    finder = await make_client("finder@example.com")
    future = (date.today() + timedelta(days=2)).isoformat()
    assert (
        await finder.post("/items", json={**ITEM, "found_on": future})
    ).status_code == 422
    assert (
        await finder.post("/items", json={**ITEM, "category": "spaceship"})
    ).status_code == 422
    assert (await finder.post("/items", json={**ITEM, "title": "a"})).status_code == 422


async def test_finder_marks_item_returned_and_reopens(make_client):
    finder = await make_client("finder@example.com")
    other = await make_client("other@example.com")
    item = (await finder.post("/items", json=ITEM)).json()
    url = f"/items/{item['id']}"

    claim = (
        await other.post(
            f"{url}/claims",
            json={"message": "It has my student card with the name Ann Lee inside."},
        )
    ).json()

    assert (await other.patch(url, json={"status": "returned"})).status_code == 403

    res = await finder.patch(url, json={"status": "returned"})
    assert res.status_code == 200, res.text
    assert res.json()["status"] == "returned"
    claims = (await finder.get(f"{url}/claims")).json()
    assert {c["id"]: c["status"] for c in claims} == {claim["id"]: "rejected"}

    res = await finder.patch(url, json={"status": "open"})
    assert res.status_code == 200, res.text
    assert res.json()["status"] == "open"


async def test_cannot_reopen_item_with_approved_claim(make_client):
    finder = await make_client("finder@example.com")
    owner = await make_client("owner@example.com")
    item = (await finder.post("/items", json=ITEM)).json()
    url = f"/items/{item['id']}"

    claim = (
        await owner.post(
            f"{url}/claims",
            json={"message": "It has my student card with the name Ann Lee inside."},
        )
    ).json()
    assert (await finder.post(f"/claims/{claim['id']}/approve")).status_code == 200

    assert (await finder.patch(url, json={"status": "open"})).status_code == 409
    assert (await finder.get(url)).json()["status"] == "returned"
