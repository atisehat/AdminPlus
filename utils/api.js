//CommonFetch - API Functions for Dynamics 365
function fetchUsers(callback) {
    Xrm.WebApi.retrieveMultipleRecords('systemuser', '?$select=systemuserid,fullname,_businessunitid_value&$filter=(isdisabled eq false)').then(callback);
}
function fetchRolesForUser(userId, callback) {
	Xrm.WebApi.retrieveMultipleRecords('systemuserroles', `?$filter=systemuserid eq ${userId}`).then(callback);
}
function fetchTeamsForUser(userId, callback) {
	Xrm.WebApi.retrieveMultipleRecords('systemuser', `?$select=fullname&$expand=teammembership_association($select=name,teamtype)&$filter=systemuserid eq ${userId}`).then(callback);
}
function fetchBusinessUnitName(userId, callback) {
	Xrm.WebApi.retrieveMultipleRecords('systemuser', `?$select=fullname&$expand=businessunitid($select=name)&$filter=systemuserid eq ${userId}`).then(callback);
}
function fetchBusinessUnits(callback) {
	Xrm.WebApi.retrieveMultipleRecords('businessunit', '?$select=businessunitid,name').then(callback);
}
function fetchTeams(callback) {
	Xrm.WebApi.retrieveMultipleRecords('team', '?$select=teamid,name&$expand=businessunitid($select=name)&$filter=(teamtype eq 0 or teamtype eq 1) and isdefault eq false').then(callback);
}
function fetchSecurityRoles(businessUnitId, callback) {
	Xrm.WebApi.retrieveMultipleRecords('role', `?$select=roleid,name&$filter=_businessunitid_value eq ${businessUnitId}`).then(callback);
}

