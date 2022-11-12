import axios from "axios";
import { useState, useEffect } from "react";
import { ITEMS_PER_PAGE } from "./constant";
import InfiniteScroll from "react-infinite-scroller";
import twin from "twin.macro";

const CoinsCardContainer = twin.article`
  w-full
  flex 
  flex-col 
  items-center   
  bg-white
  overflow-y-auto
`;

const LoadingContainer = twin.div`
  w-full
  flex
  items-center
  justify-center
  text-blue-400
  text-base
  p-6
`;

const CoinItem = twin.div`
  h-10
  w-full
  flex
  items-center
  justify-between
  border-b-2
  border-gray-200
  p-6
`;
const CoinImg = twin.img`
  h-9
  w-auto
`;

const CoinRank = twin.b`
  w-5
  text-black
  text-sm
`;

const CoinName = twin.h4`
  w-20  
  text-black
  text-base
`;

const CoinInfo = twin.h6`
  w-32 
  text-gray-500
  text-base
`;

const wait = (timeout) =>
	new Promise((resolve) => setTimeout(resolve, timeout));

function Coins(props) {
	const [coins, setCoins] = useState([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasmore] = useState(true);
	const [totalCount, setTotalCount] = useState(200);
	const [offset, setOffset] = useState(-ITEMS_PER_PAGE);

	let isEmptyCoins = !coins || coins.length === 0;

	const getCoinImageUrl = (img) =>
		`https://assets.coincap.io/assets/icons/${img.toLowerCase()}@2x.png`;

	const fetchCoins = async () => {
		setLoading(true);

		const newOffset = offset + ITEMS_PER_PAGE;

		const response = await axios
			.get("https://api.coincap.io/v2/assets", {
				params: { limit: ITEMS_PER_PAGE, offset: newOffset },
			})
			.catch((err) => {
				console.log("Error: ", err);
			});

		await wait(2000);

		if (response && response.data && loading) {
			const newCoins = [...coins, ...response.data.data];

			if (newCoins.length >= totalCount) {
				setHasmore(false);
			}

			setCoins(newCoins);

			setOffset(newOffset);
		}

		setLoading(false);
	};

	useEffect(() => {
		const onScroll = function () {
			if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
				fetchCoins();
			}
		};
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<CoinsCardContainer>
			<InfiniteScroll
				pageStart={0}
				loadMore={fetchCoins}
				hasMore={hasMore}
				loader={<LoadingContainer>Loading...</LoadingContainer>}
				threshold={350}
				initialLoad={true}
				style={{ width: "80%" }}
			>
				{!isEmptyCoins &&
					coins.map((coin, idx) => (
						<CoinItem key={idx}>
							<CoinRank>{coin.rank}</CoinRank>
							<CoinImg src={getCoinImageUrl(coin.symbol)} />
							<CoinName>{coin.name}</CoinName>
							<CoinInfo>{Number(coin.priceUsd).toFixed(2)}</CoinInfo>
							<CoinInfo>{Number(coin.marketCapUsd).toFixed(2)}</CoinInfo>
						</CoinItem>
					))}
			</InfiniteScroll>
		</CoinsCardContainer>
	);
}

export default Coins;
