package server

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (s *server) initStatic(router *httprouter.Router) { // Handler for `assets`, serving the files of the web app. They are embedded in a go file to create one standalone binary
	router.NotFound = http.FileServer(assets)
}
