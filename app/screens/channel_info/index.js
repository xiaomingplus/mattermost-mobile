// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {
    closeDMChannel,
    closeGMChannel,
    leaveChannel,
    markFavorite,
    unmarkFavorite
} from 'app/actions/views/channel';
import {getTheme} from 'app/selectors/preferences';

import {getChannelStats, deleteChannel} from 'mattermost-redux/actions/channels';
import {General} from 'mattermost-redux/constants';
import {
    getCurrentChannel,
    getCurrentChannelStats,
    getChannelsByCategory,
    canManageChannelMembers
} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId, getUser, getStatusForUserId, getCurrentUserRoles} from 'mattermost-redux/selectors/entities/users';
import {getUserIdFromChannelName, showDeleteOption} from 'mattermost-redux/utils/channel_utils';
import {isAdmin, isChannelAdmin, isSystemAdmin} from 'mattermost-redux/utils/user_utils';

import ChannelInfo from './channel_info';

function mapStateToProps(state, ownProps) {
    const {config, license} = state.entities.general;
    const currentChannel = getCurrentChannel(state);
    const currentChannelCreator = getUser(state, currentChannel.creator_id);
    const currentChannelCreatorName = currentChannelCreator && currentChannelCreator.username;
    const currentChannelStats = getCurrentChannelStats(state);
    const currentChannelMemberCount = currentChannelStats && currentChannelStats.member_count;
    const currentUserId = getCurrentUserId(state);
    const favoriteChannels = getChannelsByCategory(state).favoriteChannels.map((f) => f.id);
    const isCurrent = currentChannel.id === state.entities.channels.currentChannelId;
    const isFavorite = favoriteChannels.indexOf(currentChannel.id) > -1;
    const roles = getCurrentUserRoles(state);

    let status;
    if (currentChannel.type === General.DM_CHANNEL) {
        const teammateId = getUserIdFromChannelName(currentUserId, currentChannel.name);
        status = getStatusForUserId(state, teammateId);
    }

    return {
        ...ownProps,
        canDeleteChannel: showDeleteOption(config, license, currentChannel, isAdmin(roles), isSystemAdmin(roles), isChannelAdmin(roles)),
        currentChannel,
        currentChannelCreatorName,
        currentChannelMemberCount,
        isCurrent,
        isFavorite,
        status,
        theme: getTheme(state),
        canManageUsers: canManageChannelMembers(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeDMChannel,
            closeGMChannel,
            deleteChannel,
            getChannelStats,
            leaveChannel,
            markFavorite,
            unmarkFavorite
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelInfo);