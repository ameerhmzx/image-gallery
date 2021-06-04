function haveReadAccess(folder, user) {
    if (folder.owner == user) return true;
    for (var partner of folder.partners) {
        return partner.user == user
    }
    return false;
}

function haveWriteAccess(folder, user) {
    if (folder.owner == user) return true;
    for (var partner of folder.partners)
        if (partner.user == user)
            return partner.access == 1
    return false;
}

function isOwner(folder, user) {
    return folder.owner == user
}

function validatePartner(user, partner) {
    return partner != undefined && partner != user;
}

export { haveReadAccess, haveWriteAccess, isOwner, validatePartner }
