import React, { Component } from 'react';
import {
	Page,
	Navbar,
	List,
	ListInput,
	Block,
	Row,
	Col,
	Button,
	Card,
	CardHeader,
	CardContent
} from 'framework7-react';

import { connect } from 'react-redux';
import { navigate } from '../../../config/redux/actions/routerActions';
import { DefaultNavbar, CustomBlockTitle } from '../../../components/atoms';
import { Connection, log, SQLiteTypes, SQLite, Filter } from '../../../utils';
const { ACTIVITY_HISTORY, RENCANA_KUNJUNGAN, UPDATE_HISTORY } = SQLiteTypes;

class InfoDebitur extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			detailCust: this.props.detailCust,
			arrDetailCust: [],
			history: [],
			infoUpdateData: [
				// {kategori : 'ALAMAT RUMAH', perubahan : []},
				// {kategori : 'ALAMAT KANTOR', perubahan : []},
				// {kategori : 'ALAMAT EMERGENCY', perubahan : []},
			]
		}
	}
	componentDidMount() {
		var arrDetailCust = [];
		for (const key in this.state.detailCust) {
			if(!key.includes('option_payment_')){
				log('option_payment_ tidak di tampilkan')
				arrDetailCust.push({ 'key': key, 'value': this.state.detailCust[key] })
			}
		}
		this.setState({ arrDetailCust: arrDetailCust })
		SQLite.query('SELECT * FROM collection where key = ?', [ACTIVITY_HISTORY])
			.then(res => {
				Filter.select(res, [{ 'column': 'account_number', 'operator': 'EQUAL', 'value': this.state.detailCust.account_number }]).then((resFilter) => {
					log("HASIL FILTER", resFilter)
					// resFilter.slice(0, 5);
					this.setState({ history: resFilter });
				}).catch(err => log(err))
			}).catch(err => log(err))

		SQLite.query('SELECT * FROM collection where key = ?', [UPDATE_HISTORY])
			.then(res => {
				log("UPDATE_HITORY", res)
				Filter.select(res, [
					{ 'column': 'account_number', 'operator': 'EQUAL', 'value': this.state.detailCust.account_number },
					{ 'column': 'home_address_1', 'operator': 'DOES_NOT_EQUAL', 'value': '' }
				]).then((resFilter) => {
					resFilter.slice(0, 3);
					this.setState(prevState => ({
						infoUpdateData: [...prevState.infoUpdateData, { kategori: "ALAMAT RUMAH", perubahan: resFilter.map(({ home_address_1 }) => home_address_1) }]
					}))
				}).catch(err => log(err))

				Filter.select(res, [
					{ 'column': 'account_number', 'operator': 'EQUAL', 'value': this.state.detailCust.account_number },
					{ 'column': 'office_address_1', 'operator': 'DOES_NOT_EQUAL', 'value': '' }
				]).then((resFilter) => {
					resFilter.slice(0, 3);
					this.setState(prevState => ({
						infoUpdateData: [...prevState.infoUpdateData, { kategori: "ALAMAT KANTOR", perubahan: resFilter.map(({ office_address_1 }) => office_address_1) }]
					}))
				}).catch(err => log(err))

				Filter.select(res, [
					{ 'column': 'account_number', 'operator': 'EQUAL', 'value': this.state.detailCust.account_number },
					{ 'column': 'refferal_address_1', 'operator': 'DOES_NOT_EQUAL', 'value': '' }
				]).then((resFilter) => {
					resFilter.slice(0, 3);
					this.setState(prevState => ({
						infoUpdateData: [...prevState.infoUpdateData, { kategori: "ALAMAT EMERGENCY", perubahan: resFilter.map(({ refferal_address_1 }) => refferal_address_1) }]
					}))
				}).catch(err => log(err))
				log("STATE", this.state)

			}).catch(err => log(err))
	}
	_updateData() {
		this.props.navigate('/UpdateDebitur/');
	}
	_rencanaKunjungan() {
		SQLite.query('SELECT * FROM collection where key = ?', [RENCANA_KUNJUNGAN])
			.then(res => {
				Filter.select(res, [{ 'column': 'account_number', 'operator': 'EQUAL', 'value': this.state.detailCust.account_number }]).then((resFilter) => {
					if (resFilter.length != 0) return false;
					var data = res.length != 0 ? res[0] : res;
					data.push((this.state.detailCust))
					SQLite.query(`INSERT OR REPLACE INTO collection (key, value) VALUES(?,?)`, [RENCANA_KUNJUNGAN, data])
						.then(insert => {
							log(insert)
							this.props.navigate('/Main/');
						}).catch(err => log(err))
				}).catch(err => log(err))
			})
			.catch(err => log(err))
	}
	render() {
		const { detailCust, arrDetailCust, history, infoUpdateData } = this.state;
		return (
			<Page noToolbar noNavbar style={{ paddingBottom: 60 }}>
				<DefaultNavbar title="DETAIL DEBITUR" network={Connection()} />
				<Card style={{ border: '2px solid #c0392b' }}>
					<CardHeader style={{ backgroundColor: "#c0392b", }}>
						<p style={{ color: 'white', textAlign: 'center' }}>INFO DEBITUR</p>
					</CardHeader>
					<CardContent>
						<p><b>Customer Name:</b> {detailCust.name}</p>
						<p><b>Card Number:</b> {detailCust.card_no}</p>
						<p><b>Jenis Kelamin:</b> {detailCust.sex}</p>
						<p><b>DOB:</b> {detailCust.date_of_birth}</p>
					</CardContent>
				</Card>
				<Block>
					<Row>
						<Col width="50">
							<Button fill raised onClick={() => this._updateData()} style={{ backgroundColor: '#c0392b', fontSize: 12 }}>Update Data</Button>
						</Col>
						<Col width="50">
							<Button fill raised onClick={() => this._rencanaKunjungan()} style={{ backgroundColor: '#c0392b', fontSize: 12 }}>Rencana Kunjungan</Button>
						</Col>
					</Row>
				</Block>
				<CustomBlockTitle noGap title="INFO KONTRAK" rightTitle="HASIL KUNJUNGAN" />
				<Block>
					{arrDetailCust.map((item, key) => (
						<Row key={key} noGap>
							<Col width="50" style={{ border: 1, borderStyle: 'solid', borderColor: '#a9a9a9', borderCollapse: 'collapse', alignSelf: 'stretch' }}>
								<p style={{ margin: 8 }}>{item.key.toUpperCase()}</p>
							</Col>
							<Col width="50" style={{ border: 1, borderStyle: 'solid', borderColor: '#a9a9a9', borderCollapse: 'collapse', alignSelf: 'stretch' }}>
								<p style={{ margin: 8 }}>{item.value}</p>
							</Col>
						</Row>
					))}
				</Block>
				<CustomBlockTitle title="HISTORI PENANGANAN" />
				<Block style={{ margin: 0 }}>
					{history.map((item, key) => (
						<Card key={key} style={{ border: '2px solid #c0392b' }}>
							<CardHeader style={{ backgroundColor: "#c0392b", color: 'white' }}>
								<p>HISTORI PENANGANAN</p>
							</CardHeader>
							<CardContent>
								<p><b>TANGGAL:</b> {item.created_time}</p>
								<p><b>METODE KONTAK:</b> {item.contact_mode}</p>
								<p><b>DETAIL METODE:</b> {item.contact_person}</p>
								<p><b>KONTAK:</b> {item.call_result}</p>
								<p><b>TEMPAT KUNJUNGAN:</b> {item.place_contacted} </p>
								<p><b>BERTEMU DENGAN:</b> {item.contact_person}</p>
								<p><b>KETERANGAN:</b> {item.notepad}</p>
								<p><b>PETUGAS:</b> {item.user_id}</p>
							</CardContent>
						</Card>
					))}
				</Block>
				<CustomBlockTitle noGap title="INFORMASI UPDATE DATA" />
				<Block>
					{infoUpdateData.map((item, key) => (
						<Row key={key} style={{ alignItems: 'center', marginBottom: 16 }}>
							<Col width="45" style={{ backgroundColor: '#c0392b', color: '#fff' }}>
								<p style={{ margin: 8, textAlign: 'center' }}>{item.kategori}</p>
							</Col>
							<Col width="55">
								{item.perubahan.map((val, idx) => (
									<div key={idx}>
										<div style={{ border: 1, borderStyle: 'solid', borderColor: '#c0392b', borderCollapse: 'collapse', marginBottom: 8 }}>
											<p style={{ margin: 8, textAlign: 'center' }}>{val}</p>
										</div>
									</div>
								))}
							</Col>
						</Row>
					))}
				</Block>
			</Page>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.main.user,
		detailCust: state.user.detailCust,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		//onUpdateUser: (data) => dispatch(updateUser(data)),
		//onLogin: () => dispatch(login()),
		navigate: (nav) => dispatch(navigate(nav)),
		setDetailCustomer: (detailCust) => dispatch(setDetailCustomer(detailCust)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(InfoDebitur);