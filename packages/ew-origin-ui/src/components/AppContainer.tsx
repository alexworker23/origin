// Copyright 2018 Energy Web Foundation
//
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector, 
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

import * as React from 'react';

import Web3 = require('web3');
import * as EwAsset from 'ew-asset-registry-lib'; 
// import { Certificates } from './Certificates';
import { Route, Switch } from 'react-router-dom';
// import { Demands } from './Demands';
import { StoreState, Actions } from '../types';
// import { Header } from './Header';
// import { Footer } from './Footer';
// import { Legal } from './Legal';
// import { About } from './About';
// import { Asset } from './Asset';
// import { Admin } from './Admin';
import * as queryString from 'query-string';
import './AppContainer.scss';
import * as General from 'ew-utils-general-lib';
import * as OriginIssuer from 'ew-origin-lib';
import * as Market from 'ew-market-lib';
import * as AssetContractLookupBuild from '../../node_modules/ew-asset-registry-contracts/dist/contracts/AssetContractLookup.json';
import * as AssetProducingRegistryBuild from '../../node_modules/ew-asset-registry-contracts/dist/contracts/AssetProducingRegistryLogic.json';
import * as AssetConsumingRegistryBuild from '../../node_modules/ew-asset-registry-contracts/dist/contracts/AssetConsumingRegistryLogic.json';
import * as UserLogicBuild from '../../node_modules/ew-user-registry-contracts/dist/contracts/UserLogic.json';

interface AppContainerProps extends StoreState {
    actions: Actions;
}

export class AppContainer extends React.Component<AppContainerProps, {}> {

    constructor(props: AppContainerProps) {
        super(props);
        
        // this.CertificateTable = this.CertificateTable.bind(this);
        // this.DemandTable = this.DemandTable.bind(this);
        // this.Admin = this.Admin.bind(this);
        // this.Asset = this.Asset.bind(this);
    }

    async initEventHandler(conf: General.Configuration.Entity): Promise<void> {
        const currentBlockNumber: number = await conf.blockchainProperties.web3.eth.getBlockNumber();
        const certificateContractEventHandler: General.ContractEventHandler = new General.ContractEventHandler(
            conf.blockchainProperties.certificateLogicInstance,
            currentBlockNumber
        );

        certificateContractEventHandler.onEvent('LogRetireRequest', async (event: any) =>
            this.props.actions.certificateCreatedOrUpdated(
                await (new OriginIssuer.Certificate.Entity(
                    event.returnValues._certificateId,
                    this.props.conf).sync()
                )
            )
            
        );

        certificateContractEventHandler.onEvent('LogCreatedCertificate', async (event: any) =>
            this.props.actions.certificateCreatedOrUpdated(
                await (new OriginIssuer.Certificate.Entity(
                    event.returnValues._certificateId,
                    this.props.conf).sync()
                )
            )
        );

        certificateContractEventHandler.onEvent('LogCertificateOwnerChanged', async (event: any) =>
            this.props.actions.certificateCreatedOrUpdated(
                await (new OriginIssuer.Certificate.Entity(
                    event.returnValues._certificateId,
                    this.props.conf).sync()
                )
            )
        );

        const demandContractEventHandler: General.ContractEventHandler = new General.ContractEventHandler(
            conf.blockchainProperties.demandLogicInstance,
            currentBlockNumber
        );

        // demandContractEventHandler.onEvent('LogMatcherPropertiesUpdate', async (event) => {
        //     createOrUpdateDemand(event.returnValues._id)
        // })

        demandContractEventHandler.onEvent('LogDemandFullyCreated', async (event: any) =>
            this.props.actions.demandCreatedOrUpdated(
                await (new Market.Demand.Entity(
                    event.returnValues._demandId,
                    this.props.conf).sync()
                )
            )
        );

        // demandContractEventHandler.onEvent('LogDemandExpired', async (event: any) => {
        //     createOrUpdateDemand(event.returnValues._index)
        // })

        const assetContractEventHandler: General.ContractEventHandler = new General.ContractEventHandler(
            conf.blockchainProperties.producingAssetLogicInstance,
            currentBlockNumber
        );

        assetContractEventHandler.onEvent('LogNewMeterRead', async (event: any) =>
            this.props.actions.producingAssetCreatedOrUpdated(
                await (new EwAsset.ProducingAsset.Entity(
                    event.returnValues._assetId,
                    this.props.conf
                ).sync())
            )

        );

        assetContractEventHandler.onEvent('LogAssetFullyInitialized', async (event: any) =>
            this.props.actions.producingAssetCreatedOrUpdated(
                await (new EwAsset.ProducingAsset.Entity(
                    event.returnValues._assetId,
                    this.props.conf
                ).sync())
            )
        );

        assetContractEventHandler.onEvent('LogAssetSetActive', async (event: any) =>
            this.props.actions.producingAssetCreatedOrUpdated(
                await (new EwAsset.ProducingAsset.Entity(
                    event.returnValues._assetId,
                    this.props.conf
                ).sync())
            )
        );

        assetContractEventHandler.onEvent('LogAssetSetInactive', async (event: any) =>
            this.props.actions.producingAssetCreatedOrUpdated(
                await (new EwAsset.ProducingAsset.Entity(
                    event.returnValues._assetId,
                    this.props.conf
                ).sync())
            )
        );

        const eventHandlerManager: General.EventHandlerManager = new General.EventHandlerManager(4000, conf);
        eventHandlerManager.registerEventHandler(certificateContractEventHandler);
        eventHandlerManager.registerEventHandler(demandContractEventHandler);
        eventHandlerManager.registerEventHandler(assetContractEventHandler);
        eventHandlerManager.start();
    }

    async initConf(assetContractLookupAddress: string): Promise<General.Configuration.Entity> {
        let web3: any = null;
        const params: any = queryString.parse((this.props as any).location.search);

        if (params.rpc) {
            web3 = new Web3(params.rpc);
        } else if ((window as any).ethereum) {
            web3 = new Web3((window as any).ethereum);
            try {
                // Request account access if needed
                await (window as any).ethereum.enable();
            } catch (error) {
                // User denied account access...
            }
        } else if ((window as any).web3) {
            web3 = new Web3(web3.currentProvider);
        }

        const assetLookupContractInstance: any = new web3.eth.Contract(
            (AssetContractLookupBuild as any).abi,
            assetContractLookupAddress
        );

        const assetProducingRegistryAddress: string = await assetLookupContractInstance.methods.assetProducingRegistry().call();
        const assetConsumingRegistryAddress: string = await assetLookupContractInstance.methods.assetConsumingRegistry().call();
        const userRegistryAddress: string = await assetLookupContractInstance.methods.userRegistry().call();

        return {
            blockchainProperties: {
                web3: web3,
        
                producingAssetLogicInstance: new web3.eth.Contract(
                    (AssetProducingRegistryBuild as any).abi,
                    assetProducingRegistryAddress),
                consumingAssetLogicInstance: new web3.eth.Contract(
                    (AssetConsumingRegistryBuild as any).abi,
                    assetConsumingRegistryAddress),
                
                userLogicInstance: new web3.eth.Contract(
                    (UserLogicBuild as any).abi,
                    userRegistryAddress)
            },
            offChainDataSource: {
                baseUrl: 'http://localhost:3030'
            },

            logger: null
        };

    }

    async componentDidMount(): Promise<void> {

        const conf: General.Configuration.Entity = await this.initConf((this.props as any).match.params.contractAddress);
        this.props.actions.configurationUpdated(conf);
        const accounts: string[] = await conf.blockchainProperties.web3.eth.getAccounts();
        

        // const currentUser = accounts.length > 0 ?
        //     await (new User(accounts[0], conf.blockchainProperties)).syncWithBlockchain() :
        //     null;

        (await EwAsset.ProducingAsset.getAllAssets(conf)).forEach((p: EwAsset.ProducingAsset.Entity) =>
             this.props.actions.producingAssetCreatedOrUpdated(p)
        );
        console.log(this.props);

        // (await ConsumingAsset.GET_ALL_ASSETS(conf.blockchainProperties)).forEach((c: ConsumingAsset) =>
        //     this.props.actions.consumingAssetCreatedOrUpdated(c)
        // );

        // (await Demand.GET_ALL_ACTIVE_DEMANDS(conf.blockchainProperties)).forEach((d: Demand) =>
        //     this.props.actions.demandCreatedOrUpdated(d)
        // );

        // (await Certificate.GET_ALL_CERTIFICATES(conf.blockchainProperties)).forEach((c: Certificate) =>
        //     this.props.actions.certificateCreatedOrUpdated(c)
        // );

        // this.props.actions.currentUserUpdated(currentUser !== null && currentUser.active ? currentUser : null);

        // this.initEventHandler(conf);

    }

    // Asset() {
    //     return <Asset
    //         certificates={this.props.certificates}
    //         producingAssets={this.props.producingAssets}
    //         demands={this.props.demands}
    //         consumingAssets={this.props.consumingAssets}
    //         conf={this.props.conf}
    //         currentUser={this.props.currentUser}
    //         baseUrl={(this.props as any).match.params.contractAddress}
    //     />;
    // }

    // CertificateTable() {
    //     return <Certificates
    //         baseUrl={(this.props as any).match.params.contractAddress}
    //         producingAssets={this.props.producingAssets}
    //         certificates={this.props.certificates}
    //         conf={this.props.conf}
    //         currentUser={this.props.currentUser}
    //     />;
    // }

    // DemandTable() {
    //     return <Demands
    //         conf={this.props.conf}
    //         demands={this.props.demands}
    //         consumingAssets={this.props.consumingAssets}
    //         producingAssets={this.props.producingAssets}
    //         currentUser={this.props.currentUser}
    //         baseUrl={(this.props as any).match.params.contractAddress}
    //     />;
    // }

    // Admin() {
    //     return <Admin
    //         conf={this.props.conf}
    //         currentUser={this.props.currentUser}
    //         baseUrl={(this.props as any).match.params.contractAddress}
    //     />;
    // }

    render(): JSX.Element {

        return <span>{this.props.conf ? "yes" : "no"}</span>;
        
        // if (this.props.conf == null) {
        //     return <div><p>loading...</p></div>;
        // }

        // return <div className={`AppWrapper ${false ? 'Profile--open' : ''}`}>
        //     <Header currentUser={this.props.currentUser} baseUrl={(this.props as any).match.params.contractAddress} />
        //     <Switch>

        //         <Route path={'/' + (this.props as any).match.params.contractAddress + '/assets/'} component={this.Asset} />
        //         <Route path={'/' + (this.props as any).match.params.contractAddress + '/admin/'} component={this.Admin} />
        //         <Route path={'/' + (this.props as any).match.params.contractAddress + '/certificates'} component={this.CertificateTable} />
        //         <Route path={'/' + (this.props as any).match.params.contractAddress + '/demands'} component={this.DemandTable} />
          
        //         <Route path={'/' + (this.props as any).match.params.contractAddress + '/legal'} component={Legal} />
        //         <Route path={'/' + (this.props as any).match.params.contractAddress + '/about'} component={About} />
        //         <Route path={'/' + (this.props as any).match.params.contractAddress} component={this.Asset} />

        //     </Switch>
        //     <Footer cooContractAddress={(this.props as any).match.params.contractAddress} />
        // </div>;

    }

}