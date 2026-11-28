async def test_register_login_me_logout(make_client):
    client = await make_client()

    res = await client.post(
        "/auth/register", json={"email": "Ann@Example.com", "password": "password123"}
    )
    assert res.status_code == 201
    assert res.json()["email"] == "ann@example.com"

    dup = await client.post(
        "/auth/register", json={"email": "ann@example.com", "password": "password123"}
    )
    assert dup.status_code == 409

    bad = await client.post(
        "/auth/login", data={"username": "ann@example.com", "password": "wrong-pass"}
    )
    assert bad.status_code == 401

    ok = await client.post(
        "/auth/login", data={"username": "ann@example.com", "password": "password123"}
    )
    assert ok.status_code == 200
    assert (await client.get("/auth/me")).json()["email"] == "ann@example.com"

    assert (await client.post("/auth/logout")).status_code == 204
    client.cookies.clear()
    assert (await client.get("/auth/me")).status_code == 401
