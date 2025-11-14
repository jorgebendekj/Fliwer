/* eslint-disable no-console */
/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React, { Component } from 'react';
import { AppRegistry, StyleSheet, View, Text } from 'react-native';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';

import {toast} from '../../widgets/toast/toast'


class MyAppleButton extends Component {

    constructor() {
        super();
        this.authCredentialListener = null;
        this.user = null;
        this.state = {
            credentialStateForUser: -1
        };
    }

    componentDidMount() {
        /**
         * subscribe to credential updates.This returns a function which can be used to remove the event listener
         * when the component unmounts.
         */
        this.authCredentialListener = appleAuth.onCredentialRevoked(async () => {
            console.warn('Credential Revoked');
            this.fetchAndUpdateCredentialState().catch(error =>
                this.setState({credentialStateForUser: `Error: ${error.code}`}),
            );
        });

        this.fetchAndUpdateCredentialState()
                .then(res => this.setState({credentialStateForUser: res}))
                .catch(error => this.setState({credentialStateForUser: `Error: ${error.code}`}))
    }

    componentWillUnmount() {
        /**
         * cleans up event listener
         */
        this.authCredentialListener();
    }

    signIn = async () => {
        console.log('Beginning Apple Authentication');

        // start a login request
        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [
                    appleAuth.Scope.EMAIL,
                    appleAuth.Scope.FULL_NAME
                ]
            });

            console.log('appleAuthRequestResponse', appleAuthRequestResponse);

            const {
                user: newUser,
                email,
                nonce,
                identityToken,
                authorizationCode,
                realUserStatus /* etc */,
            } = appleAuthRequestResponse;

            this.user = newUser;

            this.fetchAndUpdateCredentialState()
                    .then(res => this.setState({credentialStateForUser: res}))
                    .catch(error =>
                        this.setState({credentialStateForUser: `Error: ${error.code}`}),
                            );

            if (identityToken) {
                // e.g. sign in with Firebase Auth using `nonce` & `identityToken`
//                console.log("nonce", nonce);
//                console.log("identityToken", identityToken);
//                console.log("authorizationCode", authorizationCode);
            } else {
                // no token - failed sign-in?
                toast.error("Failed signing with apple");
                return;
            }

            if (realUserStatus === appleAuth.UserStatus.LIKELY_REAL) {
                console.log("I'm a real person!");
            }

            //console.warn(`Apple Authentication Completed, ${this.user}, ${email}`);

            //console.log(this.user);

            if (this.props.onLogin)
                this.props.onLogin(appleAuthRequestResponse);

        } catch (error) {
            if (error.code === appleAuth.Error.CANCELED) {
                console.warn('User canceled Apple Sign in.');
                if (this.props.onCancelled)
                    this.props.onCancelled();
            } else {
                console.error('Catch error.... fuck', error);
                if (this.props.onError)
                    this.props.onError(error);
            }
        }
    };

    fetchAndUpdateCredentialState = async () => {
        if (this.user === null) {
            this.setState({credentialStateForUser: 'N/A'});
        } else {
            const credentialState = await appleAuth.getCredentialStateForUser(this.user);
            if (credentialState === appleAuth.State.AUTHORIZED) {
                console.log("credentialState 'AUTHORIZED'");
                this.setState({credentialStateForUser: 'AUTHORIZED'});
            } else {
                console.log("credentialState 'NOT AUTHORIZED'", credentialState);
                this.setState({credentialStateForUser: credentialState});
            }
        }
    }

    render() {
        var {containerStyle} = this.props;

        return (
            <View style={containerStyle}>
                <AppleButton
                    style={styles.appleButton}
                    cornerRadius={4}
                    buttonStyle={AppleButton.Style.WHITE_OUTLINE}
                    buttonType={AppleButton.Type.CONTINUE}
                    onPress={() => this.signIn()}
                    />
            </View>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    };
}

const styles = StyleSheet.create({
    appleButton: {
        marginTop: 3,
        fontSize: 18,
        width: 160, // You must specify a width
        height: 45 // You must specify a height
    }
});

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(MyAppleButton);
