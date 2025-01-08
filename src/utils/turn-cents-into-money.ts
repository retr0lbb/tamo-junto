export function turnCentsIntoMoney(valueInCents: number) {
	if (valueInCents <= 0) {
		return 0;
	}

	const result = valueInCents / 100;

	return result.toFixed(2);
}
