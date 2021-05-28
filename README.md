# 1092 0528 node.js

## Setup server

This demo should used with [probe-server](https://github.com/KunoiSayami/probe-server).

Requirement:
* npm
* yarn

### Configure

To configure server listen port, use `SERVER_PORT` environment variables.

Or, Add following configure line to `config.json`:

```json
    "server": {
        "port": 8000
    }
```

### Initialization

```
$ yarn global add npx
```

### Start server

```
$ yarn start
```

## Special Thanks

Special thanks to [@undefined-moe](https://github.com/undefined-moe), who helped me configure the typescript.

## License

[![](https://www.gnu.org/graphics/agplv3-155x51.png)](https://www.gnu.org/licenses/agpl-3.0.txt)

Copyright (C) 2021 KunoiSayami

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
