package main

import (
	"fmt"
	"os"
	"github.com/lepompiste/fs-server/server"
)

func main() {
	if len(os.Args) >= 3 {
		var port string = "8008"
		if len(os.Args) >= 4 {
			port = os.Args[3]
		}
		server.InitServer(os.Args[1], os.Args[2], port)
		//fmt.Println("dir :", server.GetDir())
	} else {
		fmt.Println("Arguments Error")
		os.Exit(-1)
	}
}