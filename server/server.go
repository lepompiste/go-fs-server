package server

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/julienschmidt/httprouter"
)

// BaseAPIResponse All API response should embed this struct to put at least a status and a message as a response
type BaseAPIResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

// server represents the http server config and is used store params and data objects such as the database conn
type server struct {
	db      *sql.DB
	dirpath string
	port    string
	dbpath  string
}

// errorResponse is used to automatically make an error response with Message = msg, and write it as json
func errorResponse(w http.ResponseWriter, msg string) {
	resp := BaseAPIResponse{"error", msg}
	bytes, _ := json.Marshal(resp)
	w.Write(bytes)
}

// successResponse is used to automatically make a reponse and write it as json /!\ you have to manually set Status = success, as r should always be BaseAPIResponse or embedded
func successResponse(w http.ResponseWriter, r interface{}) {
	bytes, _ := json.Marshal(r)
	w.Write(bytes)
}

// InitServer starts the webserver, initializing api, fileserver and installation directory
// dir = root of file server, dbp = database path, port = port of the server
func InitServer(dir, dbp, port string) {
	var SERVER server = server{}
	SERVER.dirpath = dir
	SERVER.port = port
	SERVER.dbpath = dbp

	SERVER.initInstall()

	err := os.Chdir(SERVER.dirpath)
	if err != nil {
		fmt.Println("Error Path")
		os.Exit(-1)
	}

	router := httprouter.New()
	SERVER.initAPI(router)
	SERVER.initStatic(router)
	fmt.Println("Starting server on locahost:" + SERVER.port)
	http.ListenAndServe(":"+SERVER.port, router)

}
