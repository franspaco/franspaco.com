int width1 = 1300;
int height1 = 1000;
int hueMin = 0;
int hueMax = 360;
float adjust = 1;
float RA = 200;
float RB = 140;
float resolution = 20.0;
boolean colorize = true;

boolean direction = true;
boolean printing = true;
boolean doDraw = true;
boolean drawing = true;
int index = 0;
int hue = hueMin;
float angle;
float trazo = 0;
float lastDist = 0;
float calculado = (8*lcm(RA,RB)*(RA+RB))/RA;
float init[] = new float[2];
float last[] = new float[2];


void setup() {
  size(width1,height1);
  colorMode(RGB);
  background(255);
  stroke(0,0,0);
  strokeWeight(2);
  init[0] = width1/2+RA;
  init[1] = height1/2;
  last[0] = init[0];
  last[1] = init[1];
  smooth(32);
  ellipse(width1/2,height1/2,RA*2,RA*2);
  fill(255);
  textSize(32);
  String temp = "R: " + RA + "\nr: " + RB + "\nL= " + calculado;
  println(temp);
  textAlign(LEFT);
  fill(0,0,0);
  text(temp,10,30);
}

void draw(){
  if(drawing){
    if(colorize){
      setColor(hueMin,hueMax,360);
    }
    
    angle = index/resolution;
    float[] next = nextPoint(angle);
    
    float dist = getDist(next);
    if(dist<10){
      //println(dist);
      if(dist<2 && angle > 0.5){
        float temp2 = angle/TWO_PI;
        temp2 = round(temp2);
        textSize(32);
        float temp3 = (abs(calculado-trazo)/calculado)*100;
        String calc = nf(temp3,1,3);
        String temp = "R: " + RA + "\nr: " + RB + "\nL= " + calculado + "\n\u03B8f:" + temp2 + "*2pi\nTrazo: " + trazo + "\nError: " + calc + "%";
        text(temp,10,30);
        noLoop();
      }
    }
    
    if(doDraw){
      line(next[0], next[1], last[0], last[1]);
      float delta = sqrt(pow(next[0]-last[0],2) + pow(next[1]-last[1],2));
      trazo += delta;
      String temp = "" + (int)trazo;
      textSize(12);
      //text(temp,next[0]+10,next[1]);
      //ellipse(next[0],next[1],5,5);
      last = next;
      index++;
    }
    doDraw = true;
    last = next;
  }else{
    
  }
}

float gcd(float a, float b){
  while(b > 0){
    float temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

float lcm(float a, float b){
  return a * (b/gcd(a,b));
}

float [] nextPoint(float angle){
  float X = (RA+RB)*cos(angle)-RB*cos((RA/RB+1)*angle);
  float Y = (RA+RB)*sin(angle)-RB*sin((RA/RB+1)*angle);
  X = X * adjust;
  Y = Y * adjust;
  X = X + (width1/2);
  Y = -Y + (height1/2);
  float[] res = new float[2];
  res[0] = X;
  res[1] = Y;
  return res;
}

float getDist(float[] next){
  return dist(next[0], next[1], init[0], init[1]);

}

void keyPressed(){
  int k = keyCode;
  if(drawing){
    if( k=='P'){
      println("P detected");
      printing = !printing;
      if(printing){
        println("Set to loop");
        loop();
      }else{
        println("Set to noLoop");
        noLoop();
      }
    }else if(k == '0'){
      redraw();
    }else if(k == '.'){
      saveFrame("frames/output_####.png");
    }
  }else{
    
  }
}

void setColor(int low, int top, int max){
  if(colorize){
    if(direction){
      hue++;
      if(hue==top){
        direction = !direction;
      }
    }else{
      hue--;
      if(hue==low){
        direction = !direction;
      }
    }
    colorMode(HSB,max);
    stroke(hue,max,max);
  }
}

void mouseClicked(){
  //saveFrame("frames/output_####.png");
  noLoop();
}
