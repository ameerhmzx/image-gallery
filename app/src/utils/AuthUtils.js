const getUserId = function (jwtToken){
    let base64Url = jwtToken.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    let data = JSON.parse(jsonPayload);
    return data['id'];
}

export { getUserId }
