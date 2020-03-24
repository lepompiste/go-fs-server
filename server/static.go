package server

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (s *server) serveFile(file string) func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		w.Write([]byte(file))
	}
}

func (s *server) initStatic(router *httprouter.Router) {
	router.NotFound = http.FileServer(assets)
}
