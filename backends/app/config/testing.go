package config

import "github.com/flowtrove/packages/render"

// NewTestAppClients returns AppClients suitable for HTTP handler tests: render is
// initialized so Api/View responses work, but Auth is nil unless set elsewhere.
func NewTestAppClients() *AppClients {
	return &AppClients{
		render: render.New(&render.Config{}),
	}
}
