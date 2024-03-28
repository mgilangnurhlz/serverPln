### Clone repository dan masuk folder backend
```sh
git clone https://github.com/mgilangnurhlz/2223-IF215007_8-pengembangan-aplikasi-web.git
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
