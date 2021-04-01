# FourSpace

## API Documentation

1. POST "/register"

    Body

    ```
    {
        name
        email
        password
        type ["user","company"]
    }
    ```

2. POST "/login"

    Body

    ```
    {
        email,
        password,
        type ["user","company"]
    }
    ```

    Response

    ```
    {
        token
    }
    ```

3. POST "/profile"

    Body

    ```
    {
        token
    }
    ```

    Response

    ```
    {
        name,
        email,
        available (Only for users),
        openings (Only for companies),
        rating (only for users)
    }
    ```

4. GET "./companies"

    Response

    ```
    {
        companyCount,
        companies[]
    }
    ```

5. POST "./contests"

    Body

    ```
    {
        token,
        name,
        info
    }
    ```

6. GET "./contests"

    Response

    ```
    {
        contestCount,
        contests[]
    }
    ```
