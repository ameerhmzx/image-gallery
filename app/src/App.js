import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom";
import GalleryLayout from './Layouts/GalleryLayout';
import Auth from './Pages/Auth';
import AuthContext from "./Context/AuthContext";
import {useState} from "react";

function checkAuth() {
    let token = sessionStorage.getItem('jwtToken');
    return (token != null && token !== '');
}

export default function App() {

    const [authState, changeAuthState] = useState(checkAuth());

    return (
        <AuthContext.Provider value={{authState, changeAuthState}}>
            <Router>
                <Switch>
                    <Route path="/login">
                        {authState && <Redirect to='/photos'/>}
                        <Auth/>
                    </Route>
                    <Route path="/register">
                        {authState && <Redirect to='/photos'/>}
                        <Auth/>
                    </Route>
                    { authState &&
                    <GalleryLayout>
                        <Route path="/profile">Profile</Route>
                        <Route path="/shared">Shared</Route>
                        <Route path="/photos">Photos</Route>
                    </GalleryLayout>
                    }
                    <Route path="*">
                        {authState ? <Redirect to='/photos'/> : <Redirect to='/login'/>}
                    </Route>
                </Switch>
            </Router>
        </AuthContext.Provider>
    );
}