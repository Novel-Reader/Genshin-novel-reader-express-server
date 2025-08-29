import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';

const server = 'http://127.0.0.1:8081';

class Register extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      name: '',
      password: '',
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }
  
  handleSubmit = (e) => {
    e.preventDefault();
    let { email, name, password } = this.state;
    email = email.trim();
    name = name.trim();
    password = password.trim();
    if (!email || !name || !password) {
      alert("请填写完整信息");
      return;
    }
    const options = { email, name, password };
    axios
      .post(`${server}/api/user`, options)
      .then((res) => {
        if (res === 'success') {
          alert("注册成功");
        } else {
          alert("注册失败")
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          alert(err.error_massage || "注册失败");
        } else {
          alert(String(err));
        }
      });
  }
  
  render() {
    return (
      <div className="container" style={{margin: '50px'}}>
        <h3>注册</h3>
        <form>
          <div className="form-group" style={{marginBottom: '10px'}}>
            <label htmlFor="email">邮箱</label>
            <input type="email" className="form-control" id="email" name="email" onChange={this.handleChange} />
          </div>
          <div className="form-group" style={{marginBottom: '10px'}}>
            <label htmlFor="name">用户名</label>
            <input type="text" className="form-control" id="name" name="name" onChange={this.handleChange} />
          </div>
          <div className="form-group" style={{marginBottom: '10px'}}>
            <label htmlFor="password">密码</label>
            <input type="password" className="form-control" id="password" name="password" onChange={this.handleChange} />
          </div>
          <button type="submit" className="btn btn-primary" onClick={this.handleSubmit} style={{marginBottom: '10px'}}>注册</button>
        </form>
      </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('react-app'));

root.render(<Register />);
