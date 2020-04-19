package main

// to run with go run
// Embed assets folder in the assets_embedded.go file
// If a modification is made in the assets folder, you have to run this script to make it part of the binary (before compiling it of course)

import (
	"log"
	"net/http"

	"github.com/shurcooL/vfsgen"
)

func main() {
	var fs http.FileSystem = http.Dir("../assets")
	err := vfsgen.Generate(fs, vfsgen.Options{
		Filename:     "../server/assets_embedded.go",
		PackageName:  "server",
		VariableName: "assets",
	})
	if err != nil {
		log.Fatalln(err)
	}
}
