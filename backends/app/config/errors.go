package config

import "errors"

// Error Workspace Not Found
var ErrorWorkspaceNotFound = errors.New("workspace not found")

// Error You are not a member of this workspace
var ErrorYouAreNotAMemberOfThisWorkspace = errors.New("you are not a member of this workspace")
