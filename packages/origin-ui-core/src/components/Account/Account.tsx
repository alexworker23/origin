import React from 'react';
import { PageContent } from '../PageContent/PageContent';
import { useSelector } from 'react-redux';
import { getAccountLink } from '../../utils/routing';
import { getBaseURL } from '../../features/selectors';
import { NavLink, Route, Redirect } from 'react-router-dom';
import { AccountImport } from './AccountImport';
import { AccountSettings } from './AccountSettings';
import { UserRegister } from './UserRegister';
import { OrganizationForm } from './OrganizationForm';
import { OrganizationTable } from './OrganizationTable';
import { dataTest } from '../../utils/helper';
import { OrganizationView } from './OrganizationView';

export function Account() {
    const baseURL = useSelector(getBaseURL);

    const Menu = [
        {
            key: 'settings',
            label: 'Settings',
            component: AccountSettings
        },
        {
            key: 'import',
            label: 'Import',
            component: AccountImport
        },
        {
            key: 'user-register',
            label: 'Register User',
            component: UserRegister
        },
        {
            key: 'organization-register',
            label: 'Register Organization',
            component: OrganizationForm
        },
        {
            key: 'organization-table',
            label: 'Organizations',
            component: OrganizationTable
        },
        {
            key: 'organization-view',
            label: 'View Organization',
            component: OrganizationView,
            hide: true
        }
    ];

    return (
        <div className="PageWrapper">
            <div className="PageNav">
                <ul className="NavMenu nav">
                    {Menu.map(menu => {
                        if (menu.hide) {
                            return null;
                        }

                        return (
                            <li key={menu.key}>
                                <NavLink
                                    exact={true}
                                    to={`${getAccountLink(baseURL)}/${menu.key}`}
                                    activeClassName="active"
                                    {...dataTest(`account-link-${menu.key}`)}
                                >
                                    {menu.label}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <Route
                path={`${getAccountLink(baseURL)}/:key/:id?`}
                render={props => {
                    const key = props.match.params.key;
                    const matches = Menu.filter(item => {
                        return item.key === key;
                    });

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getAccountLink(baseURL)}
                        />
                    );
                }}
            />

            <Route
                exact={true}
                path={`${getAccountLink(baseURL)}`}
                render={() => (
                    <Redirect to={{ pathname: `${getAccountLink(baseURL)}/${Menu[0].key}` }} />
                )}
            />
        </div>
    );
}