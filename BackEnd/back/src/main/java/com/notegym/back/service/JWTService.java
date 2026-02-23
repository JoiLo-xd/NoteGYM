package com.notegym.back.service;

import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.notegym.back.model.User;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JWTService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    @Value("${application.security.jwt.refreshtoken}")
    private long refreshExpiration;


    public String generateToken(User user){
        return buildToken(user,jwtExpiration);
    }

    public String generateRefreshToken(User user){
        return buildToken(user,refreshExpiration);
    }

    private String buildToken(User user, long expiration){
        return Jwts.builder()
        .id(user.getUsername())
        .claims(Map.of("username", user.getUsername()))
        .subject(user.getMail())
        .issuedAt(new Date(System.currentTimeMillis()))
        .expiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(getSinginKey())
        .compact();
    }

    private SecretKey getSinginKey(){
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
