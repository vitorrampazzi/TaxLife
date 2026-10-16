# TaxLife

A web prototype for practicing the connection between browser forms, a Node.js API, and a MySQL database.

The application registers users and taxi drivers, lists records, and provides deletion controls in the interface.

## Implemented features

- User registration with name, email, and password.
- Taxi driver registration with name, email, password, car model, and license plate.
- Separate API endpoints for validating user and driver credentials.
- Password hashing with bcrypt.
- User and driver listings.
- Record deletion through the interface.

## Technology stack

| Layer | Tools |
| --- | --- |
| Interface | HTML, CSS, JavaScript, and Bootstrap 5 |
| API | Node.js and Express |
| Database | MySQL and mysql2 |
| Configuration | dotenv |
| Password hashing | bcrypt |

## Project structure

```text
public/
├── CSS/styles.css
├── JS/script.js
├── cadastroTaxista.html
├── cadastroUsuario.html
├── index.html
└── listagens.html
routes/
└── cadastro.js
server.js
package.json
package-lock.json
```

[`server.js`](server.js) defines the active API routes and serves the files in `public/`.

## Local setup

### Requirements

- Node.js and npm.
- A MySQL server.
- A database with the tables expected by the API.

The repository does not yet include a database migration or SQL installation script. The current API expects these tables and columns:

| Table | Columns used by the API |
| --- | --- |
| `tb_usuarios` | `idusers`, `Name`, `Email`, `Senha` |
| `tb_taxistas` | `Id_taxistas`, `Name`, `email`, `password`, `car_model`, `car_license_plate`, `Avaliado` |

### Installation

```bash
git clone https://github.com/vitorrampazzi/TaxLife.git
cd TaxLife
npm ci
```

Create a local `.env` using your own development database settings:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_local_password
DB_NAME=your_database_name
PORT=3000
```

Start the application:

```bash
node server.js
```

Open [http://localhost:3000](http://localhost:3000).

The interface currently calls `http://localhost:3000` directly. If you change the server port, update those URLs in the frontend as well.

## API routes

| Method | Route | Operation |
| --- | --- | --- |
| POST | `/api/usuarios` | Register a user |
| POST | `/api/taxistas` | Register a taxi driver |
| POST | `/api/login-usuario` | Validate user credentials |
| POST | `/api/login-taxista` | Validate driver credentials |
| GET | `/api/usuarios` | List users |
| GET | `/api/taxistas` | List taxi drivers |
| DELETE | `/api/usuarios/:id` | Delete a user |
| DELETE | `/api/taxistas/:id` | Delete a taxi driver |

## Project status

This is a learning prototype intended for local development. The login endpoints validate passwords but do not establish a session. Listing and deletion routes need access controls before the application is deployed with real user data.

## Next improvements

- Add database migrations or an installation script.
- Implement sessions and route permissions.
- Apply consistent input validation.
- Use relative API URLs in the interface.
- Add automated tests.
