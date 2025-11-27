// Web-compatible mock for react-native-actionsheet
import React, { Component } from 'react';
import { View, Modal, TouchableOpacity, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';

class ActionSheet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        };
    }

    show = () => {
        this.setState({ visible: true });
    }

    hide = () => {
        this.setState({ visible: false });
    }

    handlePress = (index) => {
        if (this.props.onPress) {
            this.props.onPress(index);
        }
        this.hide();
    }

    render() {
        const { options = [], cancelButtonIndex, destructiveButtonIndex, title } = this.props;
        const { visible } = this.state;

        if (!visible) return null;

        return (
            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={this.hide}
            >
                <TouchableWithoutFeedback onPress={this.hide}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.container}>
                                {title && (
                                    <View style={styles.titleContainer}>
                                        <Text style={styles.title}>{title}</Text>
                                    </View>
                                )}
                                {options.map((option, index) => {
                                    const isCancel = index === cancelButtonIndex;
                                    const isDestructive = index === destructiveButtonIndex;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.option,
                                                isCancel && styles.cancelOption,
                                                index === 0 && !title && styles.firstOption
                                            ]}
                                            onPress={() => this.handlePress(index)}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                isDestructive && styles.destructiveText,
                                                isCancel && styles.cancelText
                                            ]}>
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#f8f8f8',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingBottom: 20,
        maxHeight: '80%',
    },
    titleContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 13,
        color: '#8e8e93',
        textAlign: 'center',
        fontWeight: '500',
    },
    option: {
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#ffffff',
    },
    firstOption: {
        borderTopWidth: 0,
    },
    cancelOption: {
        marginTop: 8,
        borderTopWidth: 0,
    },
    optionText: {
        fontSize: 20,
        color: '#007AFF',
        textAlign: 'center',
    },
    destructiveText: {
        color: '#ff3b30',
    },
    cancelText: {
        fontWeight: '600',
    },
});

export default ActionSheet;

