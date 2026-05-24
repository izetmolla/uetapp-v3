package httprequest

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v3/client"
)

type HttpRequestDriver struct {
	ctx     context.Context
	Url     string            `json:"url"`
	Method  string            `json:"method"`
	Headers map[string]string `json:"headers"`
	Body    map[string]any    `json:"body"`
	Params  map[string]any    `json:"params"`
}

type HttpRequestDriverOption func(*HttpRequestDriverOptions)

type HttpRequestDriverOptions struct {
	Headers map[string]string
	Body    map[string]any
	Params  map[string]any
}

func defaultHttpRequestDriverOptions() HttpRequestDriverOptions {
	return HttpRequestDriverOptions{}
}

func WithRequestHeaders(headers map[string]string) HttpRequestDriverOption {
	return func(o *HttpRequestDriverOptions) {
		o.Headers = headers
	}
}

func WithRequestBody(body map[string]any) HttpRequestDriverOption {
	return func(o *HttpRequestDriverOptions) {
		o.Body = body
	}
}

func WithRequestParams(params map[string]any) HttpRequestDriverOption {
	return func(o *HttpRequestDriverOptions) {
		o.Params = params
	}
}

func New(cfg *HttpRequestDriver) *HttpRequestDriver {
	if cfg == nil {
		cfg = &HttpRequestDriver{}
	}
	return &HttpRequestDriver{
		ctx:     context.Background(),
		Url:     cfg.Url,
		Method:  cfg.Method,
		Headers: cfg.Headers,
		Body:    cfg.Body,
		Params:  cfg.Params,
	}
}

// Execute sends the HTTP request using the driver's Method and returns [HttpResponseOf] with body type T.
// Call as httprequest.Execute[MyType](d). For GET/POST shortcuts, use [Get] or [Post].
func Execute[T any](d *HttpRequestDriver, opts ...HttpRequestDriverOption) (*HttpResponseOf[T], error) {
	resp, err := d.doRequest(opts...)
	if err != nil {
		return nil, err
	}
	defer resp.Close()
	return newHttpResponseOf[T](resp)
}

// Get sends a GET request with the driver's Url, Params, Headers, and Body (JSON when set).
func Get[T any](d *HttpRequestDriver, opts ...HttpRequestDriverOption) (*HttpResponseOf[T], error) {
	return executeMethod[T](d, "GET", opts...)
}

// Post sends a POST request with the driver's Url, Params, Headers, and Body (JSON when set).
func Post[T any](d *HttpRequestDriver, opts ...HttpRequestDriverOption) (*HttpResponseOf[T], error) {
	return executeMethod[T](d, "POST", opts...)
}

func executeMethod[T any](d *HttpRequestDriver, method string, opts ...HttpRequestDriverOption) (*HttpResponseOf[T], error) {
	if d == nil {
		return nil, errors.New("driver is nil")
	}
	clone := *d
	clone.Method = method
	return Execute[T](&clone, opts...)
}

func (d *HttpRequestDriver) WithParams(params map[string]any) *HttpRequestDriver {
	d.Params = params
	return d
}

func (d *HttpRequestDriver) WithBody(body map[string]any) *HttpRequestDriver {
	d.Body = body
	return d
}

func (d *HttpRequestDriver) WithHeaders(headers map[string]string) *HttpRequestDriver {
	d.Headers = headers
	return d
}

func (d *HttpRequestDriver) WithMethod(method string) *HttpRequestDriver {
	d.Method = method
	return d
}

func (d *HttpRequestDriver) WithUrl(url string) *HttpRequestDriver {
	d.Url = url
	return d
}

func (d *HttpRequestDriver) WithContext(ctx context.Context) *HttpRequestDriver {
	d.ctx = ctx
	return d
}

func (d *HttpRequestDriver) doRequest(opts ...HttpRequestDriverOption) (*client.Response, error) {
	if d == nil {
		return nil, errors.New("driver is nil")
	}

	url := strings.TrimSpace(d.Url)
	if url == "" {
		return nil, errors.New("url is required")
	}

	method := strings.ToUpper(strings.TrimSpace(d.Method))
	if method == "" {
		method = "GET"
	}

	cfg, err := d.buildClientConfig(opts...)
	if err != nil {
		return nil, err
	}

	cc := client.New()
	return sendRequest(cc, method, url, cfg)
}

func (d *HttpRequestDriver) buildClientConfig(opts ...HttpRequestDriverOption) (client.Config, error) {
	o := defaultHttpRequestDriverOptions()
	for _, fn := range opts {
		fn(&o)
	}

	ctx := d.ctx
	if ctx == nil {
		ctx = context.Background()
	}

	headers := mergeStringMaps(d.Headers, o.Headers)
	params := mergeAnyMaps(d.Params, o.Params)
	body := mergeAnyMaps(d.Body, o.Body)

	cfg := client.Config{
		Ctx:    ctx,
		Header: headers,
		Param:  paramsToStringMap(params),
	}
	if len(body) > 0 {
		cfg.Body = body
	}
	return cfg, nil
}

func paramsToStringMap(params map[string]any) map[string]string {
	if len(params) == 0 {
		return nil
	}
	out := make(map[string]string, len(params))
	for k, v := range params {
		if v == nil {
			continue
		}
		switch val := v.(type) {
		case string:
			out[k] = val
		case fmt.Stringer:
			out[k] = val.String()
		default:
			out[k] = fmt.Sprint(val)
		}
	}
	return out
}

func mergeStringMaps(base, override map[string]string) map[string]string {
	if len(base) == 0 && len(override) == 0 {
		return nil
	}
	out := make(map[string]string, len(base)+len(override))
	for k, v := range base {
		out[k] = v
	}
	for k, v := range override {
		out[k] = v
	}
	return out
}

func mergeAnyMaps(base, override map[string]any) map[string]any {
	if len(base) == 0 && len(override) == 0 {
		return nil
	}
	out := make(map[string]any, len(base)+len(override))
	for k, v := range base {
		out[k] = v
	}
	for k, v := range override {
		out[k] = v
	}
	return out
}

func sendRequest(cc *client.Client, method, url string, cfg client.Config) (*client.Response, error) {
	switch method {
	case "GET":
		return cc.Get(url, cfg)
	case "POST":
		return cc.Post(url, cfg)
	case "PUT":
		return cc.Put(url, cfg)
	case "PATCH":
		return cc.Patch(url, cfg)
	case "DELETE":
		return cc.Delete(url, cfg)
	case "HEAD":
		return cc.Head(url, cfg)
	case "OPTIONS":
		return cc.Options(url, cfg)
	default:
		return cc.Custom(url, method, cfg)
	}
}
