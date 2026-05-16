package cmd

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/flowtrove/packages/render"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"github.com/uetedu/app/routes"
)

func Execute() {
	var err error
	configSettings, err := config.GetConfigSettings()
	if err != nil {
		log.Fatal(render.RenderError(err, configSettings.Address+":"+configSettings.Port))
	}
	appClients, err := config.BootApplication(*configSettings)
	if err != nil {
		log.Fatal(render.RenderError(err, configSettings.Address+":"+configSettings.Port))
	}
	app := fiber.New(fiber.Config{
		AppName: "UET App",
	})
	routes.SetupRoutes(app, appClients)

	// Run server in goroutine
	go func() {
		if err := app.Listen(configSettings.Address + ":" + configSettings.Port); err != nil {
			log.Printf("Server stopped: %v", err)
		}
	}()

	// --------- GRACEFUL SHUTDOWN ---------
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit
	fmt.Println("\nShutting down server...")

	// Create timeout context
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Shutdown Fiber
	if err := app.ShutdownWithContext(ctx); err != nil {
		log.Printf("Server shutdown failed: %v", err)
	}

	// Close DB (for underlying sql.DB)

	postgresDb, err := appClients.Postgres().DB()
	if err == nil {
		postgresDb.Close()
	}

	fmt.Println("Server gracefully stopped")
}
