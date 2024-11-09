
export function asPercent(percent: number, digits: number = 2) {
	return ((percent ?? 0) * 100).toFixed(digits);
}

export function asPercentText(percent: number, digits: number = 2) {
	return `${asPercent(percent, digits)}%`;
}

export function strToBool(str: string) {
	return (String(strToBool).toLowerCase() === 'true');
}

export function hasString(str: string | null | undefined | "") {
	if (str === undefined || str == null) {
		return false;
	}

	if (str.trim().length == 0) {
		return false;
	}

	return true;
}