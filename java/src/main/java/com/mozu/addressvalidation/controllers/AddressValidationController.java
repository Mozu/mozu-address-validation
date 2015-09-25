package com.mozu.addressvalidation.controllers;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.mozu.api.contracts.core.Address;

@Controller
@RequestMapping("/addressvalidationcapability")
public class AddressValidationController {
	private static String[] zipCodes = { "70000", "70001", "70002" };

	@RequestMapping(method = RequestMethod.POST)
	public ResponseEntity<String> validateAddress(@RequestBody String addressString,
			@RequestHeader Map<String, String> reqHeaders) throws Exception {
		List<Address> addressList = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();
		mapper.setPropertyNamingStrategy(new PropertyNamingStrategy.PascalCaseStrategy());
		Address address = mapper.readValue(addressString, Address.class);
		if (!StringUtils.isEmpty(address.getPostalOrZipCode())
				&& Arrays.asList(zipCodes).contains(address.getPostalOrZipCode())) { 
			// this address is one of the valid zip codes 
			address.setIsValidated(true);
			addressList.add(address);
		} else {
			Address address1 = cloneAddress(address);
			Address address2 = cloneAddress(address);
			Address address3 = cloneAddress(address);
			address1.setIsValidated(true);
			address2.setIsValidated(true);
			address3.setIsValidated(true);
			address1.setPostalOrZipCode(zipCodes[0]);
			address2.setPostalOrZipCode(zipCodes[1]);
			address3.setPostalOrZipCode(zipCodes[2]);
			address3.setStateOrProvince("WA");
			addressList.add(address1);
			addressList.add(address2);
			addressList.add(address3);
		}
		String result = mapper.writeValueAsString(addressList);
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.set("Content-Type", "application/json; charset=utf-8");
		return new ResponseEntity<String>(result, responseHeaders, HttpStatus.OK);
	}

	private Address cloneAddress(Address inAddress) {
		Address clonedAddress = new Address();
		clonedAddress.setAddress1(inAddress.getAddress1());
		clonedAddress.setAddress2(inAddress.getAddress2());
		clonedAddress.setAddress3(inAddress.getAddress3());
		clonedAddress.setAddress4(inAddress.getAddress4());
		clonedAddress.setCityOrTown(inAddress.getCityOrTown());
		clonedAddress.setCountryCode(inAddress.getCountryCode());
		clonedAddress.setPostalOrZipCode(inAddress.getPostalOrZipCode());
		clonedAddress.setStateOrProvince(inAddress.getStateOrProvince());
		clonedAddress.setIsValidated(inAddress.getIsValidated());
		return clonedAddress;
	}
}