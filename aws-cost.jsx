import { css, run, reduce } from 'uebersicht';  

const filters = "file://ubersicht-aws/filters/credit.json";

export const initialState = {output: '', instance: ''};
const cmd = 'aws ce get-cost-and-usage --time-period Start=$(gdate +"%Y-%m-%d" --date="-120 hours"),End=$(gdate +"%Y-%m-%d") --granularity=DAILY --metrics BlendedCost --filter ' + filters;
// --query "ResultsByTime[].[TimePeriod.Start, Total.BlendedCost.[Amount][0], Total.BlendedCost.[Unit][0]]
export const command = () => {
  return run(cmd).then((o)=>{
    return {...JSON.parse(o), status: "Success"};
  }).catch((e, o)=>{
    console.log("Error: ", e,o);
    return {"status": "Error"};
  });
}

export const refreshFrequency = 1000*60*60*2; // ms

const table = css`
  font-family: "MesloLGS NF";
  font-size: 20px;
  text-align: center;
  color: white;
  background: black;
  opacity: 0.7;
  width: 100%;
  text-align: center;
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

const renderCost = (props, dispatch) => {
    console.log(props);
    if (props.output.status == "Error") return <h3 style={{color: "#000", background: "#fff"}}>AWS: Error</h3>;
    const poutput = props.output.ResultsByTime;
    const out = poutput.map((item)=> {
      let startTime = item.TimePeriod.Start;
      const st = new Date(startTime.split("-")[0], startTime.split("-")[1], startTime.split("-")[2]);
      startTime = st.getDate().toString().padStart(2, '0') + "-" + st.getMonth().toString().padStart(2, '0') + "-" + st.getFullYear();
      const cost = "$" + (-1*parseFloat(item.Total.BlendedCost.Amount).toFixed(2)).toString();
	return <tr><td>{startTime}</td><td>{cost}</td></tr>;
    });
    return <table className={table}><tr><td colSpan="2" className={heading}>AWS Cost</td></tr>{out}</table>
}

export const render = (props, dispatch) => {
  if (!props) return;
  if (!props) return <h3 style={{color: "#000", background: "#fff"}}>AWS: Loading...</h3>;
  if (!props.output) return <h3 style={{color: "#000", background: "#fff"}}>AWS: Loading...</h3>;
  if (typeof(props) == 'string') props = JSON.parse(props);
  if (typeof(props.output) == 'string') props.output = JSON.parse(props.output);
  return renderCost(props, dispatch);
}

export const className = `
  position: absolute;
  right: 0;
  top: 140px;
  color: #fff;
  width: 20vw;
`
