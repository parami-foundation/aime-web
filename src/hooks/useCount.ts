// import { useContractRead } from "wagmi";
// import CountUpContract from '../contracts/CountUp.json';

// const CountUpAddress = '0x05336351D165b39bd5DabD4aE933ed2196Db89c6';

// export const useCount = () => {
//   const { data } = useContractRead<unknown[], string, bigint>({
//     address: CountUpAddress,
//     abi: CountUpContract.abi,
//     functionName: 'count',
//     args: [],
//   });

//   return data;
// }