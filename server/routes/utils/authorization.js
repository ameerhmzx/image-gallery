function haveReadAccess(folder, user) {
    if (isOwner(folder, user)) return true;
    for (let partner of folder.partners) {
        if(partner.user.toString() === user.toString())
            return true;
    }
    return false;
}

function haveWriteAccess(folder, user) {
    if (isOwner(folder, user)) return true;
    for (let partner of folder.partners) {
        if (partner.user.toString() === user.toString())
            return partner.access === 1
    }
    return false;
}

function isOwner(folder, user) {
    return folder.owner.toString() === user
}

function validatePartner(user, partner) {
    return partner !== undefined && partner.toString() !== user.toString();
}

export { haveReadAccess, haveWriteAccess, isOwner, validatePartner }
