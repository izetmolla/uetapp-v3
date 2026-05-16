package general

import "github.com/flowtrove/packages/models"

func (c *Controller) GetNavigations() ([]models.ServiceNavigation, error) {
	var navigations []models.ServiceNavigation
	err := c.app.Postgres().Model(&models.ServiceNavigation{}).Where("service_id = ?", c.app.ServiceID()).Find(&navigations).Error
	if err != nil {
		return nil, err
	}
	return navigations, nil
}
