# go-fs-server
Simple filesystem server in GO and JS

## Usage

```bash
./fs-server <directory path> <database directory path> [port]
```

`directory path` is the path of the directory you want to work in.

`database directory path` is the path of the directory that contains the `fs-server.db` file. This embedded database contains users and sessions.

`port` is the port on which the HTTP server will be listening on (default 8008).



An HTTP server will be started, listening on `127.0.0.1:port`. Using `nginx` or any other reverse proxy, you can make it accessible from outside.

You can then go to https://yourdomain/location_of_proxy/ to access the GUI. Your default user/password will be admin/admin. It is highly recommended to change it on first login.

## Permissions

The API is designed to not permit access of parent directory of `directory path`, forbidding usage of `.` and `..` in requested `path`.

But to avoid any unexpected behaviors from your users, you can manage permissions of folders, and not run the app as root.

## Works on top of :

- [mini.css](https://github.com/Chalarangelo/mini.css) from [Chalarangelo](https://github.com/Chalarangelo)

- [CustomElement-DropFiles](https://github.com/Grafikart/CustomElement-DropFiles) from [Grafikart](https://github.com/Grafikart)

- [httprouter](https://github.com/julienschmidt/httprouter) from [julienschmidt](https://github.com/julienschmidt)

- [vfsgen](https://github.com/shurcooL/vfsgen) from [shurcooL](https://github.com/shurcooL)

- [go-sqlite3](https://github.com/mattn/go-sqlite3)  from [mattn](https://github.com/mattn)
