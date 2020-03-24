package server

import (
	"os"
	"fmt"
	"net/http"
	"github.com/julienschmidt/httprouter"
	"database/sql"
)

var DIRPATH string
var PORTNUM string
var DBPATH string
var _db *sql.DB

type BaseApiResponse struct {
	Status string `json:"status"`
	Message string `json:"message"`
}

// InitServer starts the webserver, initializing api, fileserver and installation directory
// dir = root of file server, dbp = database path, port = port of the server
func InitServer(dir, dbp, port string) {
	DIRPATH = dir
	PORTNUM = port
	DBPATH = dbp

	initInstall()

	err := os.Chdir(DIRPATH)
	if err != nil {
		fmt.Println("Error Path")
		os.Exit(-1)
	}

	router := httprouter.New()
	initApi(router)
	http.ListenAndServe(":" + PORTNUM, router)
}