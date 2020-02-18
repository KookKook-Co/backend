# Backend

## System Overview

![System Overview](https://i.imgur.com/aTSzdOD.png)

## Requirements

-   Node
-   Docker

## Configuration

Create a `.env` file in the root directory of your project. Add
environment-specific variables on new lines in the form of `NAME=VALUE`.

See `.env.example` for example.

## Installation

```bash
$ npm install
```

## Setup the project

```bash
$ bash scripts/setup-dev.sh
```

> **Note:** Recommended for the first run.

## Running the app

1. (Optional) Seed the Database :

    ```bash
    $ bash scripts/seed.sh
    ```

2. Start the Project:

    ```bash
    $ bash scripts/run-dev.sh
    ```

    > **Note:** Backend server is listening on [localhost:3000](localhost:3000) / Adminer is listening on [localhost:8080](localhost:8080)

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Contributing

Contributions are **welcome and extremely helpful** 🙌, feel free to make discussions and open a pull request.

This project use angular [commit message guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines), please refer to the guildlines for more information.

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
