package server

import (
	"fmt"
	"net/http"
	"github.com/julienschmidt/httprouter"
)

func Test(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	fmt.Fprint(w, "TEST REUSSI")
}

func initApi(router *httprouter.Router) {
	router.GET("/api/test", Test)
	router.GET("/api/files/ls", ls)
	router.GET("/api/files/rm", rm)
	router.POST("/api/files/upload", upload)

	router.GET("/api/user/add", userAdd)
	router.GET("/api/user/del", userDel)
	router.GET("/api/user/mod", userMod)

	router.GET("/api/user/login", userLogin)
	router.GET("/api/user/logout", userLogout)
	router.GET("/api/session/test", sessionTest)
}