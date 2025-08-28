export default function Cell({cellType}: {cellType: number}) {
    switch (cellType) {
        case 1: {
            return (<div className="h-12 w-full bg-cyan-600 rounded-l-2xl"></div>)
        }
        case 2: {
            return (<div className="h-12 w-full bg-cyan-600"></div>)
        }
        case 3: {
            return (<div className="h-12 w-full bg-cyan-600 rounded-r-2xl"></div>)
        }
        default: {
            return (<div className="h-12 w-full bg-cyan-600 rounded-2xl"></div>)
        }
    }
}