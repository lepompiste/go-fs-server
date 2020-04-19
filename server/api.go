package server

import (
	"fmt"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

/**
 * Many endpoints require auth, so I could use a generic Auth handler
 * Same for path verif
 */

// Test http handler for api
func (s *server) Test(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	fmt.Fprint(w, "TEST REUSSI")
}

// initialisation of all api endpoints (routes)
func (s *server) initAPI(router *httprouter.Router) {
	router.GET("/api/test", s.Test)
	router.GET("/api/files/ls", s.ls)
	router.GET("/api/files/rm", s.rm)
	router.POST("/api/files/upload", s.upload)
	router.GET("/api/files/touch", s.touch)
	router.GET("/api/files/mkdir", s.mkdir)
	router.GET("/api/files/cat", s.cat)
	router.POST("/api/files/echo", s.echo)
	router.GET("/api/files/mv", s.mv)
	router.GET("/api/files/get", s.get)

	router.GET("/api/users/add", s.userAdd)
	router.GET("/api/users/del", s.userDel)
	router.GET("/api/users/mod", s.userMod)
	router.GET("/api/users/list", s.userList)

	router.GET("/api/session/login", s.userLogin)
	router.GET("/api/session/logout", s.userLogout)
	router.GET("/api/session/test", s.sessionTest)
}
