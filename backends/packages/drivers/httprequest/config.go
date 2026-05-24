package httprequest

import (
	"context"
	"fmt"
)

// FromConfig builds a driver from a JSONB-style config map (e.g. models.Resource.Config).
func FromConfig(config map[string]any) (*HttpRequestDriver, error) {
	return FromConfigContext(context.Background(), config)
}

// FromConfigContext is like FromConfig but uses ctx for the outbound HTTP request.
func FromConfigContext(ctx context.Context, config map[string]any) (*HttpRequestDriver, error) {
	if config == nil {
		config = map[string]any{}
	}

	url, err := configString(config, "url")
	if err != nil {
		return nil, err
	}

	return &HttpRequestDriver{
		ctx:     ctx,
		Url:     url,
		Method:  configStringOptional(config, "method"),
		Headers: configStringMap(config, "headers"),
		Body:    configAnyMap(config, "body"),
		Params:  configParamMap(config, "params"),
	}, nil
}

func configString(m map[string]any, key string) (string, error) {
	v, ok := m[key]
	if !ok || v == nil {
		return "", fmt.Errorf("%s is required", key)
	}
	s, ok := v.(string)
	if !ok {
		return "", fmt.Errorf("%s must be a string", key)
	}
	return s, nil
}

func configStringOptional(m map[string]any, key string) string {
	v, ok := m[key]
	if !ok || v == nil {
		return ""
	}
	s, _ := v.(string)
	return s
}

func configStringMap(m map[string]any, key string) map[string]string {
	v, ok := m[key]
	if !ok || v == nil {
		return nil
	}

	switch h := v.(type) {
	case map[string]string:
		return h
	case map[string]any:
		out := make(map[string]string, len(h))
		for k, val := range h {
			if val == nil {
				continue
			}
			if s, ok := val.(string); ok {
				out[k] = s
			} else {
				out[k] = fmt.Sprint(val)
			}
		}
		return out
	default:
		return nil
	}
}

func configParamMap(m map[string]any, key string) map[string]any {
	v, ok := m[key]
	if !ok || v == nil {
		return nil
	}

	switch h := v.(type) {
	case map[string]any:
		return h
	case map[string]string:
		out := make(map[string]any, len(h))
		for k, val := range h {
			out[k] = val
		}
		return out
	default:
		return nil
	}
}

func configAnyMap(m map[string]any, key string) map[string]any {
	v, ok := m[key]
	if !ok || v == nil {
		return nil
	}
	if b, ok := v.(map[string]any); ok {
		return b
	}
	return nil
}
