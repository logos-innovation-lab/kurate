/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type {
  GlobalAnonymousFeed,
  GlobalAnonymousFeedInterface,
} from "../GlobalAnonymousFeed";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "semaphoreAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_groupId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "IdentityAlreadyExists",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "identityCommitment",
        type: "uint256",
      },
    ],
    name: "NewIdentity",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "NewMessage",
    type: "event",
  },
  {
    inputs: [],
    name: "groupId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "identityCommitment",
        type: "uint256",
      },
    ],
    name: "joinGroup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "registeredIdentities",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "semaphore",
    outputs: [
      {
        internalType: "contract ISemaphore",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "merkleTreeRoot",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nullifierHash",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "externalNullifier",
        type: "uint256",
      },
      {
        internalType: "uint256[8]",
        name: "proof",
        type: "uint256[8]",
      },
    ],
    name: "sendMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604051620009f7380380620009f783398181016040528101906200003791906200014a565b816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508060018190555060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16639c1121416001546014306040518463ffffffff1660e01b8152600401620000e093929190620001be565b600060405180830381600087803b158015620000fb57600080fd5b505af115801562000110573d6000803e3d6000fd5b50505050505062000281565b6000815190506200012d816200024d565b92915050565b600081519050620001448162000267565b92915050565b600080604083850312156200015e57600080fd5b60006200016e858286016200011c565b9250506020620001818582860162000133565b9150509250929050565b6200019681620001fb565b82525050565b620001a78162000239565b82525050565b620001b8816200022f565b82525050565b6000606082019050620001d56000830186620001ad565b620001e460208301856200019c565b620001f360408301846200018b565b949350505050565b600062000208826200020f565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600062000246826200022f565b9050919050565b6200025881620001fb565b81146200026457600080fd5b50565b62000272816200022f565b81146200027e57600080fd5b50565b61076680620002916000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c806311eeaf081461005c57806367c9c0971461008c5780637b5d2534146100a8578063a0f44c92146100c6578063eed02e4b146100e4575b600080fd5b610076600480360381019061007191906104b1565b610100565b6040516100839190610583565b60405180910390f35b6100a660048036038101906100a1919061041e565b610120565b005b6100b0610223565b6040516100bd919061059e565b60405180910390f35b6100ce610247565b6040516100db91906105dd565b60405180910390f35b6100fe60048036038101906100f991906104b1565b61024d565b005b60026020528060005260406000206000915054906101000a900460ff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16633bc778e360015486898960405160200161017392919061056a565b6040516020818303038152906040528051906020012060001c8787876040518763ffffffff1660e01b81526004016101b096959493929190610621565b600060405180830381600087803b1580156101ca57600080fd5b505af11580156101de573d6000803e3d6000fd5b505050507f476e04c786e60f629af918e59f7b2d948f3b488bf1258cab1bf3a4351521b46f86866040516102139291906105b9565b60405180910390a1505050505050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60015481565b600115156002600083815260200190815260200160002060009054906101000a900460ff16151514156102ac576040517f6b41035600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16631783efc3600154836040518363ffffffff1660e01b81526004016103099291906105f8565b600060405180830381600087803b15801561032357600080fd5b505af1158015610337573d6000803e3d6000fd5b5050505060016002600083815260200190815260200160002060006101000a81548160ff0219169083151502179055507f8295284d5d3269bfeaedc920c6506a3ee3bf86b36a96719fefb22fc606dc26628160405161039691906105dd565b60405180910390a150565b6000819050826020600802820111156103b957600080fd5b92915050565b60008083601f8401126103d157600080fd5b8235905067ffffffffffffffff8111156103ea57600080fd5b60208301915083600182028301111561040257600080fd5b9250929050565b60008135905061041881610719565b92915050565b600080600080600080610180878903121561043857600080fd5b600087013567ffffffffffffffff81111561045257600080fd5b61045e89828a016103bf565b9650965050602061047189828a01610409565b945050604061048289828a01610409565b935050606061049389828a01610409565b92505060806104a489828a016103a1565b9150509295509295509295565b6000602082840312156104c357600080fd5b60006104d184828501610409565b91505092915050565b6104e761010083836106f9565b5050565b6104f48161069f565b82525050565b610503816106d5565b82525050565b60006105158385610683565b93506105228385846106f9565b61052b83610708565b840190509392505050565b60006105428385610694565b935061054f8385846106f9565b82840190509392505050565b610564816106cb565b82525050565b6000610577828486610536565b91508190509392505050565b600060208201905061059860008301846104eb565b92915050565b60006020820190506105b360008301846104fa565b92915050565b600060208201905081810360008301526105d4818486610509565b90509392505050565b60006020820190506105f2600083018461055b565b92915050565b600060408201905061060d600083018561055b565b61061a602083018461055b565b9392505050565b60006101a082019050610637600083018961055b565b610644602083018861055b565b610651604083018761055b565b61065e606083018661055b565b61066b608083018561055b565b61067860a08301846104da565b979650505050505050565b600082825260208201905092915050565b600081905092915050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b60006106e0826106e7565b9050919050565b60006106f2826106ab565b9050919050565b82818337600083830152505050565b6000601f19601f8301169050919050565b610722816106cb565b811461072d57600080fd5b5056fea2646970667358221220de6e3549fad51fa1dee90615e2ed01ca7e35fd29f141dc6206ecead565d9b3ad64736f6c63430008040033";

type GlobalAnonymousFeedConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: GlobalAnonymousFeedConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class GlobalAnonymousFeed__factory extends ContractFactory {
  constructor(...args: GlobalAnonymousFeedConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    semaphoreAddress: PromiseOrValue<string>,
    _groupId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<GlobalAnonymousFeed> {
    return super.deploy(
      semaphoreAddress,
      _groupId,
      overrides || {}
    ) as Promise<GlobalAnonymousFeed>;
  }
  override getDeployTransaction(
    semaphoreAddress: PromiseOrValue<string>,
    _groupId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      semaphoreAddress,
      _groupId,
      overrides || {}
    );
  }
  override attach(address: string): GlobalAnonymousFeed {
    return super.attach(address) as GlobalAnonymousFeed;
  }
  override connect(signer: Signer): GlobalAnonymousFeed__factory {
    return super.connect(signer) as GlobalAnonymousFeed__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): GlobalAnonymousFeedInterface {
    return new utils.Interface(_abi) as GlobalAnonymousFeedInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GlobalAnonymousFeed {
    return new Contract(address, _abi, signerOrProvider) as GlobalAnonymousFeed;
  }
}
