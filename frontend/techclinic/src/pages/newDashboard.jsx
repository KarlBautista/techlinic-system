
import NewNavigation from '../components/newNavigation.jsx'

const NewDashboard = () => {
    return (
        <div className='h-screen w-full flex flex-col sm:flex-row'>
            <div className='h-[8%] w-full order-last sm:order-0 sm:w-[25%] sm:h-full md:w-[23%] lg:w-[20%]'>
                <NewNavigation/>
            </div>
            <div className='h-[92%]  w-full sm:h-full sm:w-[75%]'>
                
            </div>
        </div>
    )
}

export default NewDashboard
