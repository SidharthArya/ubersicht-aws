import { css, run, reduce } from 'uebersicht';  


export const initialState = {output: '', instance: ''};
export const command = () => {
  return run("aws ec2 describe-instances").then((o)=>{
    return {...JSON.parse(o), status: "Success"};
  }).catch((e, o)=>{
    return {"status": "Error"};
  });
}

export const refreshFrequency = 10000 // ms

const table = css`
  font-family: "MesloLGS NF";
  font-size: 20px;
  text-align: center;
  color: white;
  background: black;
  opacity: 0.7;
  width: 100%;
`

const heading = css`
  text-decoration: underline;
`

const instanceN = css`
  padding-right: 50px;
  background: "#555";
`

const instanceB = css`
  background: "#f21";
  margin: 0px;
`
const button = css`
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
`
const running = css

const renderInstances = (props, dispatch) => {
    if (props.output.status == "Error") return <h3 style={{color: "#000", background: "#fff"}}>AWS: Error</h3>;
    const poutput = props.output.Reservations;
    const out = poutput.map((item)=> {
	return item.Instances.map((instance)=>{
	    const instanceName = instance.Tags[0].Value;
	    const instanceId = instance.InstanceId;
	    const instanceState = instance.State.Code;
	    const keyName = instance.KeyName;
	    const sshUrl = instance.PublicDnsName;
	    if (props.output.instance && props.output.instance === instanceName) {return <tr key={instanceName}> <td className={instanceB} style = {{color: "yellow", borderColor: "yellow"}}></td><td className={instanceN}> {instanceName}</td></tr>;}
	    let p = props;
	    switch(instanceState) {
	      case 16: { return <tr key={instanceName}> <td className={instanceB} style = {{color: "green", borderColor: "green" }}>
		<button className={button} onClick={() => {props.output.instance = instanceName; run('aws ec2 stop-instances --instance-ids ' + instanceId).then((outputd) => dispatch(p))}}></button></td><td className={instanceN}><button className={button} onClick={()=> {run("bash ./ubersicht-aws/scripts/ssh.sh 'ssh -i ~/.ssh/" + keyName + ".pem ubuntu@" + sshUrl + "' 'tmux attach-session || tmux'").then((o)=>{console.log(o);dispatch(props)})}}>{instanceName}</button></td></tr>; break; }
	      case 80: { return <tr key={instanceName}> <td className={instanceB} style = {{color: "red", borderColor: "red" }}>
		<button className={button} onClick={() => {props.output.instance = instanceName; run('aws ec2 start-instances --instance-ids ' + instanceId).then((outputd) => dispatch(p))}}></button></td><td className={instanceN}>{instanceName}</td></tr>; break; }
	      default: { return <tr key={instanceName}> <td className={instanceB} style = {{color: "yellow", borderColor: "yellow" }}>
		<button className={button}></button></td><td className={instanceN}>{instanceName}</td></tr>; break; }
		    
	    }
	})[0];
    });
    return <table className={table}><tr><td colSpan="2" className={heading}>AWS Instances</td></tr>{out}</table>
}

export const render = (props, dispatch) => {
  if (!props) return;
  if (!props) return <h3 style={{color: "#000", background: "#fff"}}>AWS: Loading...</h3>;
  if (!props.output) return <h3 style={{color: "#000", background: "#fff"}}>AWS: Loading...</h3>;
  if (typeof(props) == 'string') props = JSON.parse(props);
  if (typeof(props.output) == 'string') props.output = JSON.parse(props.output);
  return renderInstances(props, dispatch);
}

export const className = `
  position: absolute;
  width: 20vw;
  right: 0;
  top: 0;
  color: #fff
`
