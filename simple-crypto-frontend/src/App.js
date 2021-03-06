import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Scroll from 'react-scroll'
import './App.css';
var scroll = Scroll.animateScroll;

class App extends Component {
  // Initialize state
  state = {
	widthOfPage: 888,
	fixOffsetTop: 600 - 70,
	hasClassOpenNav: false,
	hasClassSticky: false,
	privatePem: null,
	publicPem: null,
	isLoadingKey: false,
	RSAKey: null,
	inputText: null,
	RSAOutput: 'Kết quả ...',
	RSAType: 'Encryption',
	isRSAEncrypting: false,
	RSASignature: '',
	RSASignResult: '> Kết quả ...',
	isRSASigning: false,
	AESKey: null,
	AESOutput: 'Kết quả ...',
	AESType: 'Encryption',
	isAESEncrypting: false,
	};
  // Fetch RSAKey after first mount
  componentDidMount() {
	window.onscroll = () => {
		if(window.pageYOffset < 100)
			this.setState({hasClassSticky: false});
		else
			this.setState({hasClassSticky: true});
    };
	this.getRSAKey();
	this.setState({widthOfPage: window.innerWidth});
	if(window.innerWidth <= 360)
		this.setState({fixOffsetTop: 560 - 70});
  }
  
  componentWillUnmount() {
    window.onscroll = null;
  }
  
  clickToggle(e) {
	e.preventDefault();
    this.setState({hasClassOpenNav: !this.state.hasClassOpenNav});
  }

  scrollToTop(e) {
	e.preventDefault();
    scroll.scrollToTop({
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart'
    });
  }

  scrollTo(e, ref) {
	e.preventDefault();
	var element = ReactDOM.findDOMNode(this.refs[ref]);
	var y = this.state.fixOffsetTop;
	if(ref === 'aes-encryption')
		y += 4;
    scroll.scrollTo(element.offsetTop + y, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart'
    });
	this.setState({hasClassOpenNav: false});
  }
  
  handleChange(e) {
	// Named the inputs to match their corresponding values in state
	this.setState({ [e.target.name]: e.target.value });
  }
  
  // Get the RSAKey and store them in state
  getRSAKey() {
	this.setState({isLoadingKey: true});
    fetch('/api/create-rsa-key')
      .then(res => res.json())
      .then(data => this.setState({
		privatePem: data.privatePem,
		publicPem: data.publicPem,
		isLoadingKey: false
	  }));
  }
  
  RSAEncryption() {
	this.setState({isRSAEncrypting: true});
	var post = {
		RSAKey: this.state.RSAKey,
		inputText: this.state.inputText,
		RSAType: this.state.RSAType
	}
	// Send Key, input data, get the output data and store in state
    fetch('/api/rsa-encryption', {
      method: 'POST',
	  headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
	  },
      body: JSON.stringify(post),
    }).then(res => res.json())
	.then(data => {
		var dataOutput = data.RSAOutput;
		if (dataOutput.startsWith('err'))
			dataOutput = 'Đã có lỗi xảy ra, vui lòng kiểm tra lại khóa và thử lại sau.';
		this.setState({
			RSAOutput: dataOutput,
			isRSAEncrypting: false});
		}
	);
  }
  
  RSASign() {
	this.setState({isRSASigning: true});
	var post = {
		RSAKey: this.state.RSAKey,
		inputText: this.state.inputText,
		RSASignature: this.state.RSASignature
	}
	// Send Key, input data, get the output data and store in state
    fetch('/api/rsa-sign', {
      method: 'POST',
	  headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
	  },
      body: JSON.stringify(post),
    }).then(res => res.json())
	.then(data => {
		var dataResult = data.RSASignResult;
		switch(dataResult) {
		case 'success':
		  dataResult = '> SIGN SUCCESS: Chữ ký được tạo thành công.';
		  break;
		case 'true':
		  dataResult = '> VERIFY TRUE: Chữ ký là trùng khớp.';
		  break;
		case 'false':
		  dataResult = '> VERIFY FALSE: Chữ ký không trùng khớp.';
		  break;
		default:	// failure
			dataResult = '> ERROR: Vui lòng kiểm tra lại khóa và thử lại sau.';
		}
		this.setState({
			RSASignResult: dataResult,
			RSASignature: data.RSASignature,
			isRSASigning: false});
		}
	);
  }
  
  AESEncryption() {
	this.setState({isAESEncrypting: true});
	var post = {
		AESKey: this.state.AESKey,
		inputText: this.state.inputText,
		AESType: this.state.AESType
	}
	// Send Key, input data, get the output data and store in state
    fetch('/api/aes-encryption', {
      method: 'POST',
	  headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
	  },
      body: JSON.stringify(post),
    }).then(res => res.json())
	.then(data => {
		var dataOutput = data.AESOutput; ;
		switch(dataOutput.substring(0, 4)) {
			case 'err0':
				dataOutput = 'KEY ERROR: Khóa không hợp lệ.';
				break;
			case 'err1':
				dataOutput = 'DATA ERROR: Dữ liệu bị bỏ trống.';
				break;
			case 'err2':
				if(dataOutput.endsWith('bad decrypt'))
					dataOutput = 'KEY ERROR: Khóa không chính xác.';
				else
					dataOutput = 'DECRYPT ERROR: Bản mã lỗi, hãy kiểm tra lại.';
				break;
			default:	// without error
				;
		}
		this.setState({
			AESOutput: dataOutput,
			isAESEncrypting: false});
		}
	);
  }

  // Render app
  render() {
	var HeaderClass = ['my-header'],
		ToggleClass = ['my-toggle'],
		DashClass = ['dash'],
		doit = "Let's do it",
		loading = "Loading... ";
	if(this.state.hasClassSticky) {
		HeaderClass.push('sticky');
	}
	if(this.state.hasClassOpenNav) {
		HeaderClass.push('open-nav');
		ToggleClass.push('click');
		DashClass.push('orange');
	}
	if(this.state.widthOfPage <= 768) {
		doit = "Done";
		loading = "Wait";
	}
	var buttonValueS01 = "Create RSA Key",
		buttonValueS02 = doit,
		buttonValueS03 = doit,
		buttonValueS04 = doit;
	if (this.state.isLoadingKey) buttonValueS01 = "  Loading...  ";
	if (this.state.isRSAEncrypting) buttonValueS02 = loading;
	if (this.state.isRSASigning) buttonValueS03 = loading;
	if (this.state.isAESEncrypting) buttonValueS04 = loading;
    return (
		<div className="App">
			{/* Header & Navigation */}
			<header className={HeaderClass.join(" ")}>
				<div className="row">
					<a className="logo" href="#home"
						onClick={this.scrollToTop}>
						428/512</a>
					<div className={ToggleClass.join(" ")}
						onClick={this.clickToggle.bind(this)}>
						<div className={DashClass.join(" ")}/>
						<div className={DashClass.join(" ")}/>
						<div className={DashClass.join(" ")}/>
					</div>
					<nav className="my-nav">
						<ul>
							{/*document.getElementById("create-rsa-key").offsetTop;*/}
							<li><a href="#create-rsa-key"
								onClick={(e) => this.scrollTo(e, "create-rsa-key")}>
								Create RSA Key</a></li>
							<li><a href="#rsa-encryption"
								onClick={(e) => this.scrollTo(e, "rsa-encryption")}>
								Key Exchange</a></li>
							<li><a href="#rsa-sign"
								onClick={(e) => this.scrollTo(e, "rsa-sign")}>
								Sign/Verify</a></li>
							<li><a href="#aes-encryption"
								onClick={(e) => this.scrollTo(e, "aes-encryption")}>
								AES Encryption</a></li>
						</ul>
					</nav>
				</div>
			</header>
			{/* Banner */}
			<div className="banner">
				<h1><span>Simple</span><br />Cryptography</h1>
				<p>Đồ án được thực hiện bởi nhóm hai thành viên Nguyễn Minh Quang - 1412428 và Phạm Văn Thế - 1412512. Sử dụng NodeJs là ngôn ngữ lập trình chính.</p>
				<div className="mouse">
					<span></span>
				</div>
			</div>
			{/* List Section */}
			<div className="row content">
				{/* Section 01: Create RSA Key */}
				<h1 id="create-rsa-key" ref="create-rsa-key">Khởi tạo khóa</h1>
				<p>Tiến hành việc sinh khóa RSA. Trong đó, cặp khóa khởi tạo bằng module <a href="https://www.npmjs.com/package/node-rsa" target="_blank" rel="noopener noreferrer">node-rsa</a>, có độ dài 2048-bits và được hiển thị dưới định dạng PEM-Base64 với tiêu chuẩn PKCS#1 cho khóa Private và PKCS#8 cho khóa Public. Các khóa RSA người dùng nhập vào để sử dụng ở các phần sau đều phải tuân theo đúng định dạng này.</p>
				<div className="Output">
					<input type="button" disabled={this.state.isLoadingKey}
						className="button" value={buttonValueS01}
						onClick={this.getRSAKey.bind(this)}/>
					<h2>Private Key</h2>
					<textarea className="Output-key" readOnly rows="27" value={this.state.privatePem}/>
					<h2>Public Key</h2>
					<textarea className="Output-key" readOnly rows="9" value={this.state.publicPem}/>
				</div>
				{/* Section 02: Key Exchange */}
				<h1 id="rsa-encryption" ref="rsa-encryption">trao đổi khóa</h1>
				<p>Trong đồ án này nhóm chỉ sử dụng RSA để trao đổi khóa, chứ không triển khai các thuật toán khác như Diffie–Hellman, ECDH, PSK,... Cụ thể, sẽ thực hiện việc mã hóa một khóa AES cho trước bằng RSA hoặc tiến hành việc giải mã ngược lại để thu được khóa ban đầu. Nói cách khác đây chính là quá trình mã hóa/giải mã dữ liệu người dùng nhập vào bằng RSA, bản mã được Encode-Base64.</p>
				<textarea name="RSAKey" className="Input-text" rows="3" required
					onChange={this.handleChange.bind(this)}
					placeholder="Nhập khóa RSA. Khóa Public/Private để mã hóa hoăc giải mã ..."/>
				<textarea name="inputText" className="Input-text" rows="3"
					onChange={this.handleChange.bind(this)}
					placeholder="Nhập khóa AES. Bản rõ để mã hóa, bản mã để giải mã ..."/>
				<div className="Input">
					<select className="select" name="RSAType" value={this.state.RSAType} onChange={this.handleChange.bind(this)}>
						<option value="Encryption">Encryption: Mã hóa khóa AES bằng RSA với khóa Public.</option>
						<option value="Decryption">Decryption: Dùng RSA với khóa Private để giải mã.</option>
					  </select>
					<input type="button" disabled={this.state.isRSAEncrypting}
						className="button multi-line" value={buttonValueS02}
						onClick={this.RSAEncryption.bind(this)}/>
				</div>
				<div className="Output">
					<h2>Output</h2>
					<textarea readOnly rows="3" value={this.state.RSAOutput}/>
				</div>
				{/* Section 03: Sign/Verify */}
				<h1 id="rsa-sign" ref="rsa-sign">Ký và xác minh chữ ký</h1>
				<p>Sử dụng RSA để tạo chữ ký (Sign) cho dữ liệu hoặc xác minh chữ ký (Verify) xem có ứng với dữ liệu gốc hay không. Cả hai quá trình phải thực hiện trên cùng một dữ liệu ban đầu, chữ ký được Encode-Base64.</p>
				<textarea name="RSAKey" className="Input-text"
					onChange={this.handleChange.bind(this)} rows="3"
					placeholder="Nhập khóa RSA. Khóa Private/Public để ký hoăc kiểm tra chữ ký ..."/>
				<textarea name="inputText" className="Input-text"
					onChange={this.handleChange.bind(this)} rows="3"
					placeholder="Nhập dữ liệu ..."/>
				<textarea name="RSASignature" className="Input-text"
					value={this.state.RSASignature}
					onChange={this.handleChange.bind(this)} rows="3"
					placeholder="Nhập chữ ký để kiểm tra. Để trống nếu là ký ..."/>
				<div className="Input">
					<input type="button" disabled={this.state.isRSASigning}
						className="button multi-line" value={buttonValueS03}
						onClick={this.RSASign.bind(this)}/>
					<input type="text" className="Output-result"
						readOnly value={this.state.RSASignResult}/>
				</div>
				{/* Section 04: AES Encryption */}
				<h1 id="aes-encryption" ref="aes-encryption">Mã hóa dữ liệu</h1>
				<p>Sử dụng hàm băm SHA-256 để băm khóa người dùng nhập vào, đảm bảo thu được khóa cuối cùng có độ dài đúng bằng 256-bits. Sau đó tiến hành thực hiện việc mã hóa/giải mã dữ liệu được cung cấp bằng thuật toán AES Mode-CBC (Cipher Block Chaining) với khóa kể trên. Bản mã sau khi mã hóa sẽ được Encode-Base64.</p>
				<textarea name="inputText" className="Input-text" rows="3"
					onChange={this.handleChange.bind(this)}
					placeholder="Nhập dữ liệu ..."/>
				<input type="text" name="AESKey" className="Input-text"
					onChange={this.handleChange.bind(this)}
					placeholder="Nhập khóa AES ..."/>
				<div className="Input">
					<select className="select" name="AESType" value={this.state.AESType} onChange={this.handleChange.bind(this)}>
						<option value="Encryption">Encryption: Mã hóa dữ liệu với khóa được cung cấp.</option>
						<option value="Decryption">Decryption: Sử dụng khóa nhập vào để giải mã dữ liệu.</option>
					  </select>
					<input type="button" disabled={this.state.isAESEncrypting}
						className="button multi-line" value={buttonValueS04}
						onClick={this.AESEncryption.bind(this)}/>
				</div>
				<div className="Output">
					<h2>Output</h2>
					<textarea readOnly rows="3" value={this.state.AESOutput}/>
				</div>
			</div>
			{/* Footer */}
			<footer className="my-footer">
				<p>Copyright © 2018 by <a href="https://www.qskminhquang.tk/" target="_blank" rel="noopener noreferrer">
					Minh Quang</a>. Original web design by <a href="https://codepen.io/MarcRay/pen/vmJBn" target="_blank" rel="noopener noreferrer">
					MarcLibunao</a>. Image source: <a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer">Unplash.</a></p>
			</footer>
		</div>
    );
  }
}

export default App;