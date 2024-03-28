### Clone repository dan masuk folder
```sh
git clone clone https://github.com/mgilangnurhlz/serverPln.git
```

### Install node module dan library
```sh
npm install
```

### Membuat database auth_db pada http://localhost/phpmyadmin/
```sql
CREATE DATABASE pln_baru;
```

### Menyesuaikan database
```js
pass = {Your enail pass}
SESS_SECRET = "231jhbi3b4jn6k45i64lkif"
DB_NAME = "pln_baru"
DB_USERNAME = "root"
DB_PASSWORD = ""
DB_HOST = "localhost"
```

### Jalankan program
```sh
nodemon index.js
```

### Membuat Admin
```json
{
    "name": "admin",
    "email": "admin@gmail.com",
    "password": "123456",
    "confPassword": "123456",
    "role": "admin",
    "office": "UPT",
    "division": "IT",
    "status": "active"
}
```
