import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    useTheme,
    ListItemIcon,
    DialogActions,
    Button,
    Grid,
    Box
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import { Role, OrganizationInvitationStatus } from '@energyweb/origin-backend-core';
import { getUserOffchain, getInvitations } from '../../features/users/selectors';
import { useTranslation } from '../..';
import { Trans } from 'react-i18next';
import { Brightness1 } from '@material-ui/icons';
import OrgAddedIcon from '../../../assets/icon-org-added.svg';

export const RoleChangedModal = () => {
    const user = useSelector(getUserOffchain);
    const [showModal, setShowModal] = useState(false);
    const userRef = useRef(user);
    const { t } = useTranslation();
    const {
        typography: { fontSizeSm },
        palette: {
            text: { primary }
        }
    } = useTheme();
    const sender = useSelector(getInvitations).find(
        (invitation) => invitation.status === OrganizationInvitationStatus.Accepted
    )?.sender;

    useEffect(() => {
        if (user?.organization && userRef.current) {
            const { rights: newRole } = user;
            const { rights: oldRole, organization: oldOrganization } = userRef.current;
            if (!oldOrganization || oldRole !== newRole) {
                setShowModal(true);
            }
        }
        userRef.current = user;
    }, [user]);

    const getAsRoleYouCan = (rights: Role) => {
        switch (rights) {
            case Role.OrganizationAdmin:
                return t('user.feedback.roleChanged.asOrgAdminYouCan');
            case Role.OrganizationDeviceManager:
                return t('user.feedback.roleChanged.asDeviceManYouCan');
            case Role.OrganizationUser:
                return t('user.feedback.roleChanged.asMemberYouCan');
        }
    };

    const allowedActions = (rights: Role) => {
        const prefix = 'user.feedback.roleChanged';
        let actions: string[];
        switch (rights) {
            case Role.OrganizationUser:
                actions = [
                    'canPlaceOrder',
                    'canBuyIRec',
                    'canCreateAndBuyIRecBundles',
                    'canRedeemIRec',
                    'canWidrawIRec'
                ];
                break;
            case Role.OrganizationDeviceManager:
                actions = [
                    'canRegisterDevices',
                    'canRequestIssuenceOfIRec',
                    'canConfigureAutomatedOrderCreation'
                ];
                break;
            case Role.OrganizationAdmin:
                actions = [
                    'canRegisterDevices',
                    'canRequestIssuenceOfIRec',
                    'canConfigureAutomatedOrderCreation',
                    'canAddOrRemoveOrgMembers',
                    'connectOrgToIRec'
                ];
                break;
            default:
                actions = [];
                break;
        }
        return actions.map((action) => `${prefix}.${action}`);
    };

    return (
        <Dialog open={showModal} onClose={() => setShowModal(false)} scroll="body">
            <DialogTitle>
                <Grid container>
                    <Grid item xs={3}>
                        <img src={OrgAddedIcon} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                    </Grid>
                    <Grid item xs={9}>
                        <Box pl={2}>
                            <Trans
                                i18nKey="user.feedback.roleChanged.succesfullyJoinedOrg"
                                values={{
                                    orgName: user?.organization?.name
                                }}
                            />
                            <br />
                            <br />
                            <Box
                                fontSize={fontSizeSm}
                                fontWeight="fontWeightRegular"
                                color="text.secondary"
                            >
                                <Trans
                                    style={{ fontSize: fontSizeSm }}
                                    i18nKey={getAsRoleYouCan(user?.rights)}
                                    values={{
                                        orgName: user?.organization?.name,
                                        admin: sender
                                    }}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                <Grid container>
                    <Grid item xs={3}></Grid>
                    <Grid item xs={9}>
                        <Box color="text.secondary" fontSize={fontSizeSm}>
                            <List dense>
                                {allowedActions(user?.rights).map((action) => (
                                    <ListItem key={action}>
                                        <ListItemIcon>
                                            <Brightness1 style={{ fontSize: 7, color: primary }} />
                                        </ListItemIcon>
                                        <ListItemText>{t(action)}</ListItemText>
                                    </ListItem>
                                ))}
                            </List>
                            {[Role.OrganizationAdmin, Role.OrganizationDeviceManager].includes(
                                user?.rights
                            ) && (
                                <div>
                                    {t('user.feedback.roleChanged.asAMemberYouCanAlso')}
                                    <br />
                                    <br />
                                    <List dense>
                                        {allowedActions(Role.OrganizationUser).map((action) => (
                                            <ListItem key={action}>
                                                <ListItemIcon>
                                                    <Brightness1
                                                        style={{ fontSize: 7, color: primary }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText>{t(action)}</ListItemText>
                                            </ListItem>
                                        ))}
                                    </List>
                                </div>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button color="primary" variant="contained" onClick={() => setShowModal(false)}>
                    {t('general.responses.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
