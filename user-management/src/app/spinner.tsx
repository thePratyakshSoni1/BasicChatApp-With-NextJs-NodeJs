import spinnerStyles from "./spinner.module.css" 
export default function Spinner( {isVisible}: {isVisible: boolean} ){
    return isVisible ? <div className={spinnerStyles.lds_spinner}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    : <></>
}