package main

import (
	"fmt"
	"math/rand"
	"os"
	"time"

	"github.com/robinjulien/fs-server/server"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

func main() {
	if len(os.Args) >= 3 {
		var port string = "8008"
		if len(os.Args) >= 4 {
			port = os.Args[3]
		}
		server.InitServer(os.Args[1], os.Args[2], port)
	} else {
		fmt.Println("Usage : fs-server <files path> <db path> [port]")
		os.Exit(-1)
	}
}
